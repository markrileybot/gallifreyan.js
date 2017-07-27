/*!!
 *  Gallifreyan transliterator v0.0.1
 *  Will render text as circular gallifreyan designed Loren Sherman
 *  (http://www.shermansplanet.com/gallifreyan) (c) Loren Sherman.
 *
 *  Licensed under the MIT license:
 *  http://www.opensource.org/licenses/mit-license.php
 *
 *  Author:
 *  Mark Riley based on work by Loren Sherman
 *
 *  TODO: Lots
 *
 *  Simple use:
 *  // draw on a html5 canvas
 *  gallifrey.transliterate("HELLO").draw($("canvas")[0].getContext("2d"));
 *
 *  // draw on a C2S SVG canvas
 *  var ctx = new C2S(600, 600);
 *  gallifrey.transliterate("HELLO").draw(ctx);
 */

var gallifrey = gallifrey || {};
if (typeof exports !== 'undefined') {
    exports.gallifrey = gallifrey;
}

(function(g) {


/*******************************************************
 *
 * Classes for drawables, words, sentences, etc
 *
 *******************************************************/

    /**
     * Drawable for letters like 'b'
     * @constructor
     */
    g.JoinCircle = function() {};
    g.JoinCircle.prototype.clip = function(ctx, width, height, w2, h2) {
        ctx.beginPath();
        ctx.arc(0, -w2 + .05*width, w2, 0, Math.PI * 2, true);
        ctx.clip();
    };
    g.JoinCircle.prototype.offset = function(ctx, width, height, w2, h2) {
        return -w2 + .05*width;
    };
    g.JoinCircle.prototype.draw = function(ctx, width, height, w2, h2) {
        ctx.beginPath();
        ctx.arc(0, -w2 + .05*width, w2, 0, Math.PI * 2, true);
        ctx.stroke();
        return -w2 + .05*width;
    };
    /**
     * Drawable for letters like 't'
     * @constructor
     */
    g.JoinHalfCircle = function() {};
    g.JoinHalfCircle.prototype.clip = function(ctx, width, height, w2, h2) {
        ctx.beginPath();
        ctx.arc(0, 0, w2 - 8, 0, Math.PI*2, true);
        ctx.clip();
    };
    g.JoinHalfCircle.prototype.draw = function(ctx, width, height, w2, h2) {
        ctx.save();
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(0, 0, w2, 0, Math.PI*2, true);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.fillStyle = "#FFFFFF";
        ctx.translate(0, - 4);
        ctx.beginPath();
        ctx.arc(0, 0, w2 - 8, 0, Math.PI*2, true);
        ctx.fill();
        ctx.restore();
        return 0;
    };
    /**
     * Drawable for letters like 'y' and the similar vowel
     * @constructor
     */
    g.CrossCircle = function(scale) {
        this.factor = scale;
    };
    g.CrossCircle.prototype.draw = function(ctx, width, height, w2, h2) {
        ctx.save();
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(0, 0, w2 * this.factor, 0, Math.PI*2, true);
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.fillStyle = "#FFFFFF";
        ctx.translate(0, - 4);
        ctx.beginPath();
        ctx.arc(0, 0, w2 * this.factor - (8 * this.factor), 0, Math.PI*2, true);
        ctx.fill();
        ctx.restore();
        return 0;
    };
    /**
     * Drawable for and the similar vowel
     * @constructor
     */
    g.InCircle = function(scale) {
        this.factor = scale;
    };
    g.InCircle.prototype.offset = function(ctx, width, height, w2, h2) {
        return -(w2 * this.factor) + 20;
    };
    g.InCircle.prototype.draw = function(ctx, width, height, w2, h2) {
        var w3 = w2 * this.factor;
        ctx.save();
        ctx.fillStyle = "#000000";
        ctx.translate(0, -w3 + 5);
        ctx.beginPath();
        ctx.arc(0, 0, w3, 0, Math.PI*2, true);
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.fillStyle = "#FFFFFF";
        ctx.translate(0, -w3 + 3);
        ctx.beginPath();
        ctx.arc(0, 0, w3 - 6, 0, Math.PI*2, true);
        ctx.fill();
        ctx.restore();
        return -w3;
    };
    /**
     * Drawable for and the similar vowel
     * @constructor
     */
    g.OutCircle = function(scale) {
        this.factor = scale;
    };
    g.OutCircle.prototype.draw = function(ctx, width, height, w2, h2) {
        var w3 = w2 * this.factor;
        ctx.save();
        ctx.fillStyle = "#000000";
        ctx.translate(0, w3 + 9);
        ctx.beginPath();
        ctx.arc(0, 0, w3, 0, Math.PI*2, true);
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.fillStyle = "#FFFFFF";
        ctx.translate(0, w3 + 6);
        ctx.beginPath();
        ctx.arc(0, 0, w3 - 6, 0, Math.PI*2, true);
        ctx.fill();
        ctx.restore();
        return 0;
    };
    /**
     * Drawable for dot decorations
     * @constructor
     */
    g.DecorDot = function(count) {
        this.count = count;
        this.segment = Math.PI / 1.5;
        this.rot = this.segment / count;
    };
    g.DecorDot.prototype.draw = function(ctx, width, height, w2, h2, decorOffset) {
        ctx.save();
        ctx.translate(0, decorOffset + 5);
        ctx.rotate(-this.rot *.7);
        var baseRad = .05 * height + 3*2 - this.count*2;
        var y = -h2 + .12 * height;
        for( var i = this.count; i > 0; i-- ) {
            ctx.save();
            ctx.rotate(this.rot * (this.count-i));
            ctx.beginPath();
            ctx.arc(0, y, baseRad + (i%this.count/100 * height), 0, Math.PI * 2, false);
            ctx.fill();
            ctx.restore();
        }
        ctx.restore();
    };
    /**
     * Drawable for line decorations
     * @constructor
     */
    g.DecorLine = function(count) {
        this.count = count;
        this.segment = Math.PI / 3;
        this.rot = this.segment / count;
    };
    g.DecorLine.prototype.draw = function(ctx, width, height, w2, h2, decorOffset) {
        ctx.save();
        ctx.lineWidth = 4;
        ctx.translate(0, decorOffset);
        ctx.rotate(-this.rot);
        var y1 = -h2;
        for( var i = 0; i < this.count; i++ ) {
            ctx.save();
            ctx.rotate(this.rot * i);
            ctx.translate(0, y1);
            ctx.beginPath();
            ctx.arc(-ctx.radius*2, 0, ctx.radius*2, Math.PI * 1.5, 0, false);
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
    };
    /**
     * Drawable factory
     * @constructor
     */
    g.DrawableFactory = function() {
        this.joinCircle = new g.JoinCircle();
        this.joinHalfCircle = new g.JoinHalfCircle();
        this.inCircle = new g.InCircle(.85);
        this.crossCircle = new g.CrossCircle(1);
        this.crossVowel = new g.CrossCircle(.6);
        this.outVowel = new g.OutCircle(.5);
        this.dot2 = new g.DecorDot(2);
        this.dot3 = new g.DecorDot(3);
        this.line1 = new g.DecorLine(1);
        this.line2 = new g.DecorLine(2);
        this.line3 = new g.DecorLine(3);
    };
    g.DrawableFactory.prototype.getShape = function(id) {
        switch(id) {
            case g.BASE_SHAPE_INSIDE_CIRCLE:
                return this.inCircle;
            case g.BASE_SHAPE_JOIN_CIRCLE:
                return this.joinCircle;
            case g.BASE_SHAPE_JOIN_HALF_CIRCLE:
                return this.joinHalfCircle;
            case g.BASE_SHAPE_CROSS_CIRCLE:
                return this.crossCircle;
            case g.BASE_SHAPE_VOWEL_CROSS:
                return this.crossVowel;
            case g.BASE_SHAPE_VOWEL_OUTSIDE:
                return this.outVowel;
        }
        return null;
    };
    g.DrawableFactory.prototype.getDecor = function(id) {
        switch(id) {
            case g.DECOR_DOT_2:
                return this.dot2;
            case g.DECOR_DOT_3:
                return this.dot3;
            case g.DECOR_LINE_1:
                return this.line1;
            case g.DECOR_LINE_2:
                return this.line2;
            case g.DECOR_LINE_3:
                return this.line3;
        }
        return null;
    };

    /**
     * A character. This handles basic info about a char and
     * delegates rendering to drawables
     *
     * @param c
     * @constructor
     */
    g.Character = function(c) {
        this.c = c;
        this.info = 0;
        this.prev = g.NULL_CHAR;
        this.next = g.NULL_CHAR;

        // do some validation
        switch(c) {
            case 'c':
                throw 'C should be a K or an S';
            default:
                break;
        }

        // get the info for the char
        if(g.CHAR_MAP[c]) {
            this.info = g.CHAR_MAP[c];
        } else {
            this.info = g.CHAR_MAP['\0'];
        }
    };
    g.Character.prototype.isVowelAttachable = function() {
        return this.info.etc & g.ETC_VOWEL_ATTACH == g.ETC_VOWEL_ATTACH;
    };
    g.Character.prototype.isDrawable = function() {
        return this.info.type != g.NULL_CHAR;
    };
    g.Character.prototype.clip = function(ctx) {
        if (this.isDrawable() && this.info.shape && this.info.shape.clip) {
            // get some stuff
            var width = ctx.clipWidth;
            var height = ctx.clipHeight;
            var w2 = width / 2;
            var h2 = height / 2;

            this.info.shape.clip(ctx, width, height, w2, h2);
        }
    };
    g.Character.prototype.draw = function(ctx) {
        if(this.isDrawable()) {
            // get some stuff
            var width = ctx.clipWidth;
            var height = ctx.clipHeight;
            var w2 = width / 2;
            var h2 = height / 2;

            // draw the shape
            var decorOffset = 0;
            if( ctx.decorOnly && this.info.decor && this.info.shape.offset ) {
                decorOffset = this.info.shape.offset(ctx, width, height, w2, h2);
            } else if( !ctx.decorOnly && this.info.shape ) {
                decorOffset = this.info.shape.draw(ctx, width, height, w2, h2);
            }

            // decorate the shape
            if( ctx.decorOnly && this.info.decor ) {
                this.info.decor.draw(ctx, width, height, w2, h2, decorOffset);
            }
        }
    };

    /**
     * A word.  This handles preparing the canvas for each character
     * and drawing the word ring.
     * @constructor
     */
    g.Word = function() {
        this.chars = [];
    };
    g.Word.prototype.add = function(c) {
        if(typeof c === 'string') {
            this.add(new g.Character(c));
        } else {
            this.chars.push(c);
        }
    };
    g.Word.prototype.draw = function(ctx) {
        var i, ii,
            c = this.chars,
            len = c.length,
            width = ctx.clipWidth,
            height = ctx.clipHeight,
            w2 = width / 2,
            h2 = height / 2,
            lineWidth = ctx.lineWidth,

        // number of segments.  Making this < 1 will squeeze the letters
        // together and make them a bit larger
            segments = (len - 1) * .7,

        // Letter sizes and other measures
            charWidth = width / segments,
            charHeight = height / segments,
            charRads = Math.PI * 2 / (len - 1),
            segRads = Math.PI / 2 - charRads / 2,
            charOriginX = 0,
            charOriginY = h2 - .05 * h2; // This should be 5% higher than the bottom of the word

        // some info for the letters
        ctx.radius = w2;
        ctx.clipWidth = charWidth;
        ctx.clipHeight = charHeight;

        // origin at the center
        ctx.translate(w2, h2);

        // draw the letter ring
        ctx.save();
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(0, 0, w2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.translate(-2, -2);
        ctx.arc(0, 0, w2 - 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // draw each letter
        ctx.decorOnly = false;
        for( i = 0, ii = 0; i < len; i++, ii++ ) {
            ctx.save();
                // clip the letter inside the word
                if( (c[i].info.etc & g.ETC_NO_CLIP) == 0 ) {
                    ctx.beginPath();
                    ctx.arc(0, 0, w2, 0, Math.PI * 2);
                    ctx.clip();
                }

                // rotate about the origin so that the current
                // letter is at the bottom of the word
                if( i > 0 && c[i].info.type == g.TYPE_VOWEL && (c[i-1].info.etc & g.ETC_VOWEL_ATTACH) != 0 ) {
                    ii--;
                }
                ctx.rotate(-charRads * ii);

                ctx.save();
                    // position the letter origin.
                    ctx.translate(charOriginX, charOriginY);
                    // draw the letter
                    c[i].draw(ctx);
                ctx.restore();
            ctx.restore();
        }

        ctx.decorOnly = true;
        for( i = 0, ii = 0; i < len; i++, ii++ ) {
            ctx.save();

            // rotate about the origin so that the current
            // letter is at the bottom of the word
            if( i > 0 && c[i].info.type == g.TYPE_VOWEL && (c[i-1].info.etc & g.ETC_VOWEL_ATTACH) != 0 ) {
                ii--;
            }
            ctx.rotate(-charRads * ii);

            ctx.save();
            // position the letter origin.
            ctx.translate(charOriginX, charOriginY);
            // draw the letter
            c[i].draw(ctx);
            ctx.restore();
            ctx.restore();
        }

        // Erase the sections of the word ring that should not exist.
        // This is kind of crappy but its the easiest thing to do.
        //for( i = 0; i < len; i++ ) {
        //    if( (c[i].info.etc & g.ETC_NO_CLIP) == 0 ) {
        //        ctx.save();
        //            // rotate about the origin so that the current
        //            // letter is at the bottom of the word
        //            ctx.rotate(-charRads * i);
        //
        //            ctx.save();
        //                // position the letter origin.
        //                ctx.translate(charOriginX, charOriginY);
        //                // clip for the word arc
        //                c[i].clip(ctx);
        //                // now overwrite the word arc within the clip
        //                ctx.strokeStyle = "#FFFFFF";
        //                ctx.lineWidth = lineWidth + 2;
        //                ctx.globalCompositeOperation = 'xor';
        //                ctx.beginPath();
        //                ctx.arc(-charOriginX, -charOriginY, w2, segRads, segRads + charRads, false);
        //                ctx.stroke();
        //            ctx.restore();
        //
        //        ctx.restore();
        //    }
        //}
    };

    /**
     * A sentence.  Base drawable handles delegating to words.  This will
     * also draw punctuation and the correct sentence ring at some point.
     * @constructor
     */
    g.Sentence = function() {
        this.chars = [];
        this.words = [];
    };
    g.Sentence.prototype.add = function(c) {
        var lastChar, lastWord, word, len;
        if(typeof c === 'string') {
            this.add(new g.Character(c));
        } else {
            // TODO: for right now skipping spaces and punctuation
            if(!c.isDrawable()) {
                return;
            }

            len = this.chars.length;
            if( len > 0 ) {
                lastChar = this.chars[len-1];
            }
            len = this.words.length;
            if( len > 0 ) {
                lastWord = this.words[len-1];
            }

            word = lastWord;
            if(!word) {
                word = new g.Word();
                this.words.push(word);
            }
            word.add(c);

            c.prev = lastChar;
            if( lastChar ) {
                lastChar.next = c;
            }
            this.chars.push(c);
        }
    };
    g.Sentence.prototype.draw = function(ctx) {
        var i, c, len;
        c = this.words;
        len = c.length;

        ctx.lineWidth = 1;

        ctx.save();
        ctx.fillStyle = "#000000";
        ctx.translate(300, 300);
        ctx.beginPath();
        ctx.arc(0, 0, 232, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.fillStyle = "#FFFFFF";
        ctx.translate(298, 298);
        ctx.beginPath();
        ctx.arc(0, 0, 232 - 8, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.clipWidth = 400;
        ctx.clipHeight = 400;
        ctx.translate(100, 100);

        for( i = 0; i < len; i++ ) {
            // todo save
            // todo rotate
            // todo translate
            c[i].draw(ctx);
            // todo restore
        }
        ctx.restore();
    };


/*******************************************************
 *
 * Constants and such
 *
 *******************************************************/

    // types
    g.TYPE_NULL         = 0x0000;
    g.TYPE_CONSONANT    = 0x0001;
    g.TYPE_VOWEL        = 0x0002;
    g.TYPE_PUNCTUATION  = 0x0004;
    g.TYPE_SPACE        = 0x0008;

    // base shapes
    g.BASE_SHAPE_JOIN_CIRCLE        = 0x0001;
    g.BASE_SHAPE_INSIDE_CIRCLE      = 0x0002;
    g.BASE_SHAPE_JOIN_HALF_CIRCLE   = 0x0004;
    g.BASE_SHAPE_CROSS_CIRCLE       = 0x0008;
    g.BASE_SHAPE_VOWEL_OUTSIDE      = 0x0010;
    g.BASE_SHAPE_VOWEL_CROSS        = 0x0020;
    g.BASE_SHAPE_VOWEL_INSIDE       = 0x0040;

    // decorations
    g.DECOR_DOT_2           = 0x0001;
    g.DECOR_DOT_3           = 0x0002;
    g.DECOR_LINE_1          = 0x0004;
    g.DECOR_LINE_2          = 0x0008;
    g.DECOR_LINE_3          = 0x0010;
    g.DECOR_VOWEL_INSIDE    = 0x0020;
    g.DECOR_VOWEL_OUTSIDE   = 0x0040;

    // etc
    g.ETC_VOWEL_ATTACH      = 0x0001;
    g.ETC_NO_CLIP           = 0x0002;

    g.DRAWABLE_FACTORY = new g.DrawableFactory();

    // The character map
    g.CHAR_MAP = {
        '\0': {
            type:   g.TYPE_NULL,
            shape:  0,
            decor:  0,
            etc:    0
        },

        'b': {
            type:   g.TYPE_CONSONANT,
            shape:  g.DRAWABLE_FACTORY.getShape(g.BASE_SHAPE_JOIN_CIRCLE),
            decor:  0,
            etc:    g.ETC_VOWEL_ATTACH
        },
        '#': {
            type:   g.TYPE_CONSONANT,
            shape:  g.DRAWABLE_FACTORY.getShape(g.BASE_SHAPE_JOIN_CIRCLE),
            decor:  g.DRAWABLE_FACTORY.getDecor(g.DECOR_DOT_2),
            etc:    g.ETC_VOWEL_ATTACH
        },
        'd': {
            type:   g.TYPE_CONSONANT,
            shape:  g.DRAWABLE_FACTORY.getShape(g.BASE_SHAPE_JOIN_CIRCLE),
            decor:  g.DRAWABLE_FACTORY.getDecor(g.DECOR_DOT_3),
            etc:    g.ETC_VOWEL_ATTACH
        },
        'f': {
            type:   g.TYPE_CONSONANT,
            shape:  g.DRAWABLE_FACTORY.getShape(g.BASE_SHAPE_JOIN_CIRCLE),
            decor:  g.DRAWABLE_FACTORY.getDecor(g.DECOR_LINE_3),
            etc:    g.ETC_VOWEL_ATTACH
        },
        'g': {
            type:   g.TYPE_CONSONANT,
            shape:  g.DRAWABLE_FACTORY.getShape(g.BASE_SHAPE_JOIN_CIRCLE),
            decor:  g.DRAWABLE_FACTORY.getDecor(g.DECOR_LINE_1),
            etc:    g.ETC_VOWEL_ATTACH
        },
        'h': {
            type:   g.TYPE_CONSONANT,
            shape:  g.DRAWABLE_FACTORY.getShape(g.BASE_SHAPE_JOIN_CIRCLE),
            decor:  g.DRAWABLE_FACTORY.getDecor(g.DECOR_LINE_2),
            etc:    g.ETC_VOWEL_ATTACH
        },


        'j': {
            type:   g.TYPE_CONSONANT,
            shape:  g.DRAWABLE_FACTORY.getShape(g.BASE_SHAPE_INSIDE_CIRCLE),
            decor:  0,
            etc:    g.ETC_VOWEL_ATTACH
        },
        'k': {
            type:   g.TYPE_CONSONANT,
            shape:  g.DRAWABLE_FACTORY.getShape(g.BASE_SHAPE_INSIDE_CIRCLE),
            decor:  g.DRAWABLE_FACTORY.getDecor(g.DECOR_DOT_2),
            etc:    g.ETC_VOWEL_ATTACH
        },
        'l': {
            type:   g.TYPE_CONSONANT,
            shape:  g.DRAWABLE_FACTORY.getShape(g.BASE_SHAPE_INSIDE_CIRCLE),
            decor:  g.DRAWABLE_FACTORY.getDecor(g.DECOR_DOT_3),
            etc:    g.ETC_VOWEL_ATTACH
        },
        'm': {
            type:   g.TYPE_CONSONANT,
            shape:  g.DRAWABLE_FACTORY.getShape(g.BASE_SHAPE_INSIDE_CIRCLE),
            decor:  g.DRAWABLE_FACTORY.getDecor(g.DECOR_LINE_3),
            etc:    g.ETC_VOWEL_ATTACH
        },
        'n': {
            type:   g.TYPE_CONSONANT,
            shape:  g.DRAWABLE_FACTORY.getShape(g.BASE_SHAPE_INSIDE_CIRCLE),
            decor:  g.DRAWABLE_FACTORY.getDecor(g.DECOR_LINE_1),
            etc:    g.ETC_VOWEL_ATTACH
        },
        'p': {
            type:   g.TYPE_CONSONANT,
            shape:  g.DRAWABLE_FACTORY.getShape(g.BASE_SHAPE_INSIDE_CIRCLE),
            decor:  g.DRAWABLE_FACTORY.getDecor(g.DECOR_LINE_2),
            etc:    g.ETC_VOWEL_ATTACH
        },


        't': {
            type:   g.TYPE_CONSONANT,
            shape:  g.DRAWABLE_FACTORY.getShape(g.BASE_SHAPE_JOIN_HALF_CIRCLE),
            decor:  0,
            etc:    g.ETC_VOWEL_ATTACH
        },
        '$': {
            type:   g.TYPE_CONSONANT,
            shape:  g.DRAWABLE_FACTORY.getShape(g.BASE_SHAPE_JOIN_HALF_CIRCLE),
            decor:  g.DRAWABLE_FACTORY.getDecor(g.DECOR_DOT_2),
            etc:    g.ETC_VOWEL_ATTACH
        },
        'r': {
            type:   g.TYPE_CONSONANT,
            shape:  g.DRAWABLE_FACTORY.getShape(g.BASE_SHAPE_JOIN_HALF_CIRCLE),
            decor:  g.DRAWABLE_FACTORY.getDecor(g.DECOR_DOT_3),
            etc:    0
        },
        's': {
            type:   g.TYPE_CONSONANT,
            shape:  g.DRAWABLE_FACTORY.getShape(g.BASE_SHAPE_JOIN_HALF_CIRCLE),
            decor:  g.DRAWABLE_FACTORY.getDecor(g.DECOR_LINE_3),
            etc:    g.ETC_VOWEL_ATTACH
        },
        'v': {
            type:   g.TYPE_CONSONANT,
            shape:  g.DRAWABLE_FACTORY.getShape(g.BASE_SHAPE_JOIN_HALF_CIRCLE),
            decor:  g.DRAWABLE_FACTORY.getDecor(g.DECOR_LINE_1),
            etc:    g.ETC_VOWEL_ATTACH
        },
        'w': {
            type:   g.TYPE_CONSONANT,
            shape:  g.DRAWABLE_FACTORY.getShape(g.BASE_SHAPE_JOIN_HALF_CIRCLE),
            decor:  g.DRAWABLE_FACTORY.getDecor(g.DECOR_LINE_2),
            etc:    g.ETC_VOWEL_ATTACH
        },


        '%': {
            type:   g.TYPE_CONSONANT,
            shape:  g.DRAWABLE_FACTORY.getShape(g.BASE_SHAPE_CROSS_CIRCLE),
            decor:  0,
            etc:    g.ETC_VOWEL_ATTACH | g.ETC_NO_CLIP
        },
        'y': {
            type:   g.TYPE_CONSONANT,
            shape:  g.DRAWABLE_FACTORY.getShape(g.BASE_SHAPE_CROSS_CIRCLE),
            decor:  g.DRAWABLE_FACTORY.getDecor(g.DECOR_DOT_2),
            etc:    g.ETC_VOWEL_ATTACH | g.ETC_NO_CLIP
        },
        'z': {
            type:   g.TYPE_CONSONANT,
            shape:  g.DRAWABLE_FACTORY.getShape(g.BASE_SHAPE_CROSS_CIRCLE),
            decor:  g.DRAWABLE_FACTORY.getDecor(g.DECOR_DOT_3),
            etc:    g.ETC_VOWEL_ATTACH | g.ETC_NO_CLIP
        },
        '&': {
            type:   g.TYPE_CONSONANT,
            shape:  g.DRAWABLE_FACTORY.getShape(g.BASE_SHAPE_CROSS_CIRCLE),
            decor:  g.DRAWABLE_FACTORY.getDecor(g.DECOR_LINE_3),
            etc:    g.ETC_VOWEL_ATTACH | g.ETC_NO_CLIP
        },
        'q': {
            type:   g.TYPE_CONSONANT,
            shape:  g.DRAWABLE_FACTORY.getShape(g.BASE_SHAPE_CROSS_CIRCLE),
            decor:  g.DRAWABLE_FACTORY.getDecor(g.DECOR_LINE_1),
            etc:    g.ETC_VOWEL_ATTACH | g.ETC_NO_CLIP
        },
        'x': {
            type:   g.TYPE_CONSONANT,
            shape:  g.DRAWABLE_FACTORY.getShape(g.BASE_SHAPE_CROSS_CIRCLE),
            decor:  g.DRAWABLE_FACTORY.getDecor(g.DECOR_LINE_2),
            etc:    g.ETC_VOWEL_ATTACH | g.ETC_NO_CLIP
        },


        'a': {
            type:   g.TYPE_VOWEL,
            shape:  g.DRAWABLE_FACTORY.getShape(g.BASE_SHAPE_VOWEL_OUTSIDE),
            decor:  0,
            etc:    g.ETC_NO_CLIP
        },
        'e': {
            type:   g.TYPE_VOWEL,
            shape:  g.DRAWABLE_FACTORY.getShape(g.BASE_SHAPE_VOWEL_CROSS),
            decor:  0,
            etc:    g.ETC_NO_CLIP
        },
        'i': {
            type:   g.TYPE_VOWEL,
            shape:  g.DRAWABLE_FACTORY.getShape(g.BASE_SHAPE_VOWEL_CROSS),
            decor:  g.DRAWABLE_FACTORY.getDecor(g.DECOR_VOWEL_INSIDE),
            etc:    g.ETC_NO_CLIP
        },
        'o': {
            type:   g.TYPE_VOWEL,
            shape:  g.DRAWABLE_FACTORY.getShape(g.BASE_SHAPE_VOWEL_INSIDE),
            decor:  0,
            etc:    0
        },
        'u': {
            type:   g.TYPE_VOWEL,
            shape:  g.DRAWABLE_FACTORY.getShape(g.BASE_SHAPE_VOWEL_CROSS),
            decor:  g.DRAWABLE_FACTORY.getDecor(g.DECOR_VOWEL_OUTSIDE),
            etc:    g.ETC_NO_CLIP
        }
    };

    g.NULL_CHAR = new g.Character('\0');


/*******************************************************
 *
 * Main funcs
 *
 *******************************************************/

    /**
     * Create and return a Sentence that may be draw to an HTML5
     * canvas context or a C2S SVG context.
     *
     * @param text The text to transliterate
     * @returns {gallifrey.Sentence} to be drawn
     */
    g.transliterate = function(text) {
        var i, sentence;

        sentence = new g.Sentence();
        text = text
            .toLowerCase().trim()
            .replace(/[\s]+-[\s]+/, "-")
            .replace("ch", "#")
            .replace("sh", "$")
            .replace("th", "%")
            .replace("ng", "&")
            .replace("qu", "q")
        ;

        for( i = 0; i < text.length; i++ ) {
            try {
                sentence.add(text.charAt(i));
            } catch ( e ) {
                throw 'Invalid value at position ' + i + '.  ' + e;
            }
        }
        return sentence;
    };

})(gallifrey);
