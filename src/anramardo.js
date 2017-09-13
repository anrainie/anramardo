/**
 * Created by anrainie on 2017/9/11.
 */
mardo = {
    toHTML: function (v) {
        let rows = v.split('\n');

        let htmlReader = new mardo.HtmlReader();
        return htmlReader.read(rows);
    }
};


mardo.HtmlReader = function () {
    let status = 0;

    let read = function (rows) {
        let para;
        rows.push('');
        for (let i = 0, len = rows.length; i < len; i++) {
            if (para == null)
                para = new mardo.Paragraph();
            para = para.next(rows[i]);
        }
        return para == null ? '' : para.get();
    };

    return {
        status,
        read,
    };
};

mardo.__get = function () {
    if (this.prev == null)return this.content;
    return this.prev.get() + '' + this.content;
};
/**
 * 开始段落，需要分析整个根的类型
 * @returns {mardo.Paragraph}
 * @constructor
 */
mardo.Paragraph = function () {
    let _self = this;
    this.content = '';
    this.children = [];
    this.get = mardo.__get;
    this.next = function (row) {
        //检查是否为结束段落
        let parent = _self.getParent();
        let answer;
        if (parent != null) {
            answer = parent.checkEnd(row);
        }
        if (answer && answer.nextHandler && !answer.isEnd) {
            rr = answer.nextHandler;
        } else
            rr = Handlers[row.charAt(0)];
        if (rr == null)
            rr = Handlers.NORMAL;
        let result = rr(row);
        _self.content = result.content;

        let next = new mardo.Paragraph();
        next.prev = _self;

        if (answer && answer.isEnd) {
            if (answer != null)
                _self.content = answer.finish(_self.content);
            parent.checkEnd = null;
        } else if (result.checkEnd) {
            _self.checkEnd = result.checkEnd;
        }
        return next;
    };
    this.getParent = function () {
        let n = _self;
        while (n.prev != null) {
            n = n.prev;
            if (n.checkEnd != null)
                return n;
        }
        return null;
    };
    return this;
};

let Handlers = {
    '#'(s){
        let count = 0;
        while (s.charAt(count++) == '#' && count < 6) {
        }
        let h = 'h' + (count - 1);
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
                    checkEnd: function (s) {
                        let count = 0;
                        while (s.charAt(count++) == ' ') {
                        }
                        if (count < 4)
                            return {
                                isEnd: true,
                                finish(s){
                                    return '</code></pre>' + s;
                                }
                            };
                        else
                            return {
                                isEnd: false,
                                nextHandler(s){
                                    return {content: '\n' + s.substr(count - 1)};
                                },
                            };

                    }
                }
            }
        }

        let h = Handlers[s.charAt(count)];
        return h ? h(s.substr(count - 1)) : Handlers.NORMAL(s);
    },
    '`'(s){
        let count = 0;
        while (s.charAt(count++) == '`') {
            if (count > 2) {
                let n = s.charAt(count + 1);
                return {
                    content: '<pre><code>',
                    params: s.substr(count),
                    checkEnd: function (s) {
                        let count = 0;
                        while (s.charAt(count++) == '`') {
                        }
                        if (count > 3)
                            return {
                                isEnd: true,
                                finish(s){
                                    return '</code></pre>';
                                }
                            };
                        else
                            return {
                                isEnd: false,
                                nextHandler(s){
                                    return {content: s + '\n'};
                                },
                            };

                    }
                }
            }
        }

        return Handlers.NORMAL(s);
    },
    '>'(s){

        return {
            content: '<blockquote>'+s.substr(1),
            checkEnd(s){
                if (s == '>') {
                    return {
                        isEnd: false,
                    }
                }
                if(s==''){

                    return {
                        isEnd:true,
                        finish(){
                            return '</blockquote>'
                        }
                    }
                }
            }

        }
    },
    NORMAL(r){
        return {
            content: '<p>' + r + '</p>',
            checked: false,
        }
    }
}
