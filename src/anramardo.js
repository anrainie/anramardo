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
        let reader;
        let r = '';
        for (let i = 0, len = rows.length; i < len; i++) {
            let row = rows[i];
            if (reader == null)
                reader = anramardo.ParagraphReader.create(row);
            else
                reader = reader.next(row);
            if (reader instanceof anramardo.ParagraphEnd) {
                r += reader.get();
                reader = null;
            }

        }
        return r;
    };

    return {
        status,
        read,
    };
};

anramardo.ParagraphReader = {
    create(row){
        return new anramardo.Start().next(row);
    }
};

anramardo.Start=function(){
    this.get=function(){return ''};
    this.next=function(row){

    };
    return this;
};
anramardo.NormalReader = function (prev) {
    this.prev = prev;
    this.next = function (row) {



        return new anramardo.ParagraphEnd(this);
    };
    this.get = function () {
        return prev.get();
    };
    return this;
};
anramardo.ParagraphEnd = function (prev) {
    this.prev = prev;
    this.next = function () {
        return null;
    };
    this.get = function () {
        return prev.get();
    };
    return this;
};