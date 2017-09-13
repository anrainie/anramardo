/**
 * Created by Hasee on 2017/9/12.
 */
window.mardo = window.mardo || {};
mardo.toHTML = function (md) {
    let rows = md.split('\n');
    let para;
    let r = [];
    for (let i = 0, len = rows.length; i < len; i++) {
        if (para == null)
            para = new mardo.Paragraph();
        para = para.next(rows[i]);
        if (para.isEnd) {
            let result = para.get();
            if (result instanceof Array)
                for (let j = 0; j < result.length; j++) {
                    r.push(result[j]);
                }
            else {
                r.push(result);
            }
            para = null;
        }
    }

    return r;
};

mardo.Paragraph = function () {
    let _self = this;
    let prev = null;
    let children = [];
    this.get = function () {
        for (let i = 0, len = children.length; i < len; i++) {
            this.element.appendChild(children[i].get());
        }
        return this.element;
    };
    this.next = function (row) {
        let answer;
        if (_self.checkEnd)
            answer = _self.checkEnd(row);

        let handler = _self.handler ? _self.handler : Handlers[row.charAt(0)];
        if (handler == null)
            handler = Handlers.NORMAL;
        let result = handler(row);
        if (result.checkEnd) {
            let n = new mardo.Paragraph();
            n.prev = _self;
            return n;
        } else {
            if (answer && answer.isEnd) {
                let root = _self, tr = _self;
                while (( tr = tr.prev) != null) {
                    root = tr;
                }
                _self.prev = null;
                let combine = new mardo.CombineParagraph();
                combine.isEnd = true;
                combine.put(root);
                combine.put(_self);
                return combine;
            }
            _self.element = result.element;
            _self.isEnd = true;
            return _self;
        }

    };

    return this;
};

mardo.CombineParagraph = function () {

    let children = [];
    this.put = function (para) {
        children.push(para);
    };
    this.get = function () {
        return children;
    };
    return this;
};


let Handlers = {
    '#'(s){
        let count = 0;
        while (s.charAt(count++) == '#' && count < 6) {
        }

        let element = document.createElement('h' + (count - 1));
        element.innerHTML = s.substr(count - 1);

        return {
            element: element,
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
                    element: document.createElement('HR'),
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

                let pre = document.createElement('pre');
                let code = document.createElement('code');
                code.innerText = s.substr(count);
                pre.append(code);
                return {
                    element: pre,
                    checkEnd: function (s) {
                        let count = 0;
                        while (s.charAt(count++) == ' ') {
                        }
                        if (count < 4)
                            return {
                                end: true,
                                finish(s){
                                }
                            };
                        else
                            return{
                                handle:function(s,e){
                                    e.element.innerText+='\n'+s;
                                }
                            }
                    }
                }
            }
        }
        return Handlers.NORMAL(s);
    },
    NORMAL(s){
        let element = document.createElement('p');
        element.innerHTML = s;
        return {
            element: element,
            checked: false,
        }
    }
};