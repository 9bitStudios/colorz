
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
    // 0 - 255 => 2 char hex e.g. 155 => "9B"
    colorToHex: function (c) {
        var hex = c.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
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
    }
};




