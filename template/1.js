const Table = (_ => {
  // 2. 사용하는데 대응하는 코드를 나중에 짜면됨
  // static private
  const Private = Symbol();
  return class {
    // constructor
    constructor(parent) {
      if (typeof parent != "string" || !parent) throw "invalid param";
      this[Private] = { parent: parent };
    }
    // public method
    load(url) {
      fetch(url)
        .then(response => {
          console.log(response);
          return response.json();
        })
        .then(json => {
          const { title, header, items } = json;
          if (!items.length) throw "no items"; // data validation : 모든 인풋은 나를 엿먹인다
          Object.assign(this[Private], { title, header, items });
          console.log(this);
          this._render();
        });
    }
    // private method
    _render() {
      // 이건 private 메소드니까 밖에서는 쓰지 말았으면 좋겠어
      // 순서정리
      // 부모, 데이터 체크
      const fields = this[Private];
      console.log(fields);
      const parent = document.querySelector(fields.parent);
      if (!parent) throw "invalid parent"; // 런타임 에러는 무조건 throw 한다.
      if (!fields.items || !fields.items.length) {
        parent.innerHTML = "no data";
        return;
      } else parent.innerHTML = ""; // 부모 초기화
      // table 생성
      // 캡션을 title로
      const table = document.createElement("table");
      const caption = document.createElement("caption");
      caption.innerHTML = fields.title;
      table.appendChild(caption);
      // header를 thead로
      table.appendChild(
        fields.header.reduce((thead, data) => {
          const th = document.createElement("th");
          th.innerHTML = data;
          thead.appendChild(th);
          return thead;
        }, document.createElement("thead"))
      );
      // item을 tr로
      // 부모에 table 삽입
      parent.appendChild(
        fields.items.reduce((table, row) => {
          table.appendChild(
            row.reduce((tr, data) => {
              const td = document.createElement("td");
              td.innerHTML = data;
              tr.appendChild(td);
              return tr;
            }, document.createElement("tr"))
          );
          return table;
        }, table)
      );
    }
  }; // class는 바꿀 수 없으므로 const
})();
const table = new Table("#data");
table.load("api.json"); // 1. 사용하는 코드를 먼저 만들고
