
var colorz = window.colorz = {
    
    // either giv hex val or rgb object such as {r:255, g:23, b:144}, use conversion tools such as rgbaNotationToObject method below
    getContrastRatio: function (color1, color2) {

        var rgb1, rgb2;

        if (typeof color1 !== "object" && typeof color2 !== "object") {
            rgb1 = this.hexToRgb(color1);
            rgb2 = this.hexToRgb(color2);
        } else {
            rgb1 = color1;
            rgb2 = color2;
        }

        if (this.luminance(rgb1.r, rgb1.g, rgb1.b) > this.luminance(rgb2.r, rgb2.g, rgb2.b)) {
            return (this.luminance(rgb1.r, rgb1.g, rgb1.b) + 0.05) / (this.luminance(rgb2.r, rgb2.g, rgb2.b) + 0.05);
        } else {
            return (this.luminance(rgb2.r, rgb2.g, rgb2.b) + 0.05) / (this.luminance(rgb1.r, rgb1.g, rgb1.b) + 0.05);
        }
    },

    //http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
    //(luminanace(255, 255, 255) + 0.05) / (luminanace(255, 255, 0) + 0.05); // 1.074 for yellow
    //(luminanace(255, 255, 255) + 0.05) / (luminanace(0, 0, 255) + 0.05); // 8.592 for blue
    
    luminance: function (r, g, b) {
        var a = [r, g, b].map(function (v) {
            v /= 255;
            return (v <= 0.03928) ? v / 12.92 : Math.pow(((v + 0.055) / 1.055), 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    },
    
    // AA compliant => minimal recommended contrast ratio is 4.5 or 3 for larger font-sizes
    // large text is 18px or more... true/false?
    isAACompliant: function (color1, color2, largeText) {

        if (largeText) {
            return this.getContrastRatio(color1, color2) >= 3;
        } else {
            return this.getContrastRatio(color1, color2) >= 4.5;
        }
    },
    // AAA compliant => minimal recommended contrast ratio is 7 or 4.5 for larger font-sizes
    // large text is 18px or more... true/false?
    isAAACompliant: function (color1, color2, largeText) {

        var rgb1 = this.hexToRgb(color1);
        var rgb2 = this.hexToRgb(color2);
        if (largeText) {
            return this.getContrastRatio(color1, color2) >= 4.5;
        } else {
            return this.getContrastRatio(color1, color2) >= 7;
        }
    },
    // 2 char hex to number e.g. "9B" => 155
    hexToColor: function (c) {
        return parseInt(c, 16);
    },    
    // 0 - 255 => 2 char hex e.g. 155 => "9B"
    colorToHex: function (c) {
        var hex = Math.round(c).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    },
    // Mix 2 colors together
    mixColors: function (c1, c2) {
        
        // make sure we have an object { r: 255, g: 255, b: 255, a: 0.5 }
        if (typeof c1 !== "object") { c1 = this.hexToRgb(c1); }
        if (typeof c2 !== "object") { c2 = this.hexToRgb(c2); }

        // if no alpha property set to 1
        if (typeof c1.a === "undefined") { c1.a = 1; } 
        if (typeof c2.a === "undefined") { c2.a = 1; }

        var a = c1.a + c2.a * (1-c1.a);
        var obj = {
            r: (c1.r * c1.a + c2.r * c2.a * (1 - c1.a)) / a,
            g: (c1.g * c1.a + c2.g * c2.a * (1 - c1.a)) / a,
            b: (c1.b * c1.a + c2.b * c2.a * (1 - c1.a)) / a,
            a: a
        };
        return this.rgbToHex(obj.r, obj.g, obj.b);
    }, 
    // Alpha hex value to alpha decimal 
    // e.g. "BF" => 0.75
    alphaHexToAlphaDecimal: function (hex) {

        var num = parseInt(hex, 16) / 255;

        if (num === 1 || num === 0) {
            return num;
        } else {
            return parseFloat(num.toFixed(2));
        }

    },
    // Alpha decimalto alpha hex value 
    // e.g. 0.75 => "BF"
    alphaDecimalToAlphaHex: function (decimalPct) {
        var number = Math.round(decimalPct * 255);
        var val = number.toString(16);

        if (val.length === 1) {
            val = '0' + val;
        }
        return val;
    },
    // rgba(r,g,b,a) notation string to object
    // e.g. "rgba(186, 218, 85, 0.75)" => {r: 186, g: 218, b: 85, a: 0.75}
    rgbaNotationToObject: function (str) {

        var rgba = str.replace(/^rgba?\(|\s+|\)$/g, '').split(',');
        var obj = {};
        if (rgba.length === 4) {
            obj = {
                r: parseInt(rgba[0]),
                g: parseInt(rgba[1]),
                b: parseInt(rgba[2]),
                a: parseFloat(rgba[3])
            };
        } else if (rgba.length === 3) {
            obj = {
                r: parseInt(rgba[0]),
                g: parseInt(rgba[1]),
                b: parseInt(rgba[2])
            };
        }
        return obj;
    },
    // e.g. rgbaToHexWithAlpha(186,218,85,0.75) => "#bfbada55"
    rgbaToHexWithAlpha: function (r, g, b, a) {

        var alpha = this.alphaDecimalToAlphaHex(a);
        if (alpha === "ff") {
            alpha = "";
        }

        return "#" + alpha + this.colorToHex(r) + this.colorToHex(g) + this.colorToHex(b);
    },
    // e.g. rgbToHex(186,218,85) => "#bada55"
    rgbToHex: function (r, g, b) {
        return "#" + this.colorToHex(r) + this.colorToHex(g) + this.colorToHex(b);
    },
    // hexToRgb("#bada55") => {r: 186, g: 218, b: 85}
    hexToRgb: function (hex) {

        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : {};
    },
    
    labToRgb: function(obj){
        
        var xyz = this.labToXyz(obj);
        var rgb = this.xyzToRgb(xyz);
        return rgb;
    },

    labToXyz: function (lab) {
        var l = lab.l,
        a = lab.a,
        b = lab.b,
        x, y, z, y2;

        if (l <= 8) {
            y = (l * 100) / 903.3;
            y2 = (7.787 * (y / 100)) + (16 / 116);
        } else {
            y = 100 * Math.pow((l + 16) / 116, 3);
            y2 = Math.pow(y / 100, 1/3);
        }

        x = x / 95.047 <= 0.008856 ? x = (95.047 * ((a / 500) + y2 - (16 / 116))) / 7.787 : 95.047 * Math.pow((a / 500) + y2, 3);
        z = z / 108.883 <= 0.008859 ? z = (108.883 * (y2 - (b / 200) - (16 / 116))) / 7.787 : 108.883 * Math.pow(y2 - (b / 200), 3);

        return {x: x, y: y, z: z};
    },

    xyzToRgb: function(xyz){
        var x = xyz.x / 100,
            y = xyz.y / 100,
            z = xyz.z / 100,
            r, g, b;

        r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
        g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
        b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

        // assume sRGB
        r = r > 0.0031308 ? ((1.055 * Math.pow(r, 1.0 / 2.4)) - 0.055) : r = (r * 12.92);
        g = g > 0.0031308 ? ((1.055 * Math.pow(g, 1.0 / 2.4)) - 0.055) : g = (g * 12.92);
        b = b > 0.0031308 ? ((1.055 * Math.pow(b, 1.0 / 2.4)) - 0.055) : b = (b * 12.92);

        r = Math.min(Math.max(0, r), 1);
        g = Math.min(Math.max(0, g), 1);
        b = Math.min(Math.max(0, b), 1);

        return {r: r * 255, g: g * 255, b: b * 255};
    },

    rgbToXyz: function(obj) {
        var r = obj.r / 255, g = obj.g / 255, b = obj.b / 255;

        // assume sRGB
        r = r > 0.04045 ? Math.pow(((r + 0.055) / 1.055), 2.4) : (r / 12.92);
        g = g > 0.04045 ? Math.pow(((g + 0.055) / 1.055), 2.4) : (g / 12.92);
        b = b > 0.04045 ? Math.pow(((b + 0.055) / 1.055), 2.4) : (b / 12.92);

        var x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
        var y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
        var z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

        return {x: x * 100, y: y *100, z: z * 100};
    },

    rgbToLab: function(obj) {
        var xyz = this.rgbToXyz(obj),
              x = xyz.x,
              y = xyz.y,
              z = xyz.z,
              l, a, b;

        x /= 95.047;
        y /= 100;
        z /= 108.883;

        x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
        y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
        z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

        l = (116 * y) - 16;
        a = 500 * (x - y);
        b = 200 * (y - z);

        return { l: l, a: a, b: b };
    }
    
};




