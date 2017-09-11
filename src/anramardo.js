/**
 * Created by anrainie on 2017/9/11.
 */
anramardo = {
    toHTML: function (v) {
        let rows = v.split('\n');

        let htmlReader = new anramardo.HtmlReader();
        return htmlReader.read(rows);
    }
};


anramardo.HtmlReader = function () {
    let status = 0;

    let read = function (rows) {
        let para;
        let r = '';
        for (let i = 0, len = rows.length; i < len; i++) {
            if (para == null)
                para = new anramardo.Paragraph();
            para = para.next(rows[i]);
            if (para.isEnd) {
                r += para.get();
                para = null;
            }

        }
        return r;
    };

    return {
        status,
        read,
    };
};

anramardo.__get = function () {
    if (this.prev == null)return this.content;
    return this.prev.get() + '' + this.content;
}
/**
 * 开始段落，需要分析整个根的类型
 * @returns {anramardo.Paragraph}
 * @constructor
 */
anramardo.Paragraph = function () {
    let _self = this;
    this.content = '';
    this.get = anramardo.__get;
    this.next = function (row) {
        //检查是否为结束段落
        let answer;
        if (_self.checkEnd)
            answer = _self.checkEnd(row);

        let rr = _self.handler?_self.handler:Handlers[row.charAt(0)];
        if (rr == null)
            rr = Handlers.NORMAL;
        let result = rr(row);

        if (result.checkEnd||(answer && !answer.end)) {
            _self.content = result.content;

            let next = new anramardo.Paragraph();
            next.prev = _self;
            next.checkEnd = result.checkEnd;
            next.handler=result.nextHandler;
            console.log(_self);
            return next;
        } else {
            if (answer && answer.finish)
                _self.content = answer.finish(result.content);
            else
                _self.content = result.content;

            console.log(_self.content)
            _self.isEnd = true;
            return _self;
        }
    };
    return this;
};

let Handlers = {
    '#'(s){
        let count = 0;
        while (s.charAt(count++) == '#' && count < 6) {
        }
        let h = 'h' + (count-1);
        return {
            content: '<' + h + '>' + s.substr(count - 1) + '</' + h + '>',
            checked: true,
        };
    },
    '-'(s, c = '-'){
        let count = 0, space = 0;
        while (true) {
            let cr = s.charAt(count + space);
            if (cr == c)
                count++;
            else if (cr == ' ') space++;
            else break;
            if (count > 2)
                return {
                    content: '<HR>',
                    checked: true,
                }
        }
        return Handlers.NORMAL(s);
    },
    '*'(s){
        return Handlers['-'](s, "*");
    },
    ' '(s){
        let count = 0;
        while (s.charAt(count++) == ' ') {
            if (count > 3) {
                let n = s.charAt(count + 1);
                return {
                    content: '<pre><code>' + s.substr(count),
                    nextHandler(s){
                        return s+'\n';
                    },
                    checkEnd: function (s) {
                        let count = 0;
                        while (s.charAt(count++) == ' ') {
                        }
                        if (count < 4)
                            return {
                                end: true,
                                finish(s){
                                    '</code></pre>' + s
                                }
                            }

                    }
                }
            }
        }
        return Handlers.NORMAL(s);
    },
    NORMAL(r){
        return {
            content: '<p>' + r + '</p>',
            checked: false,
        }
    }
}
