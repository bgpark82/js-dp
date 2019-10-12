const Info = class {
  constructor(json) {
    const { title, header, items } = json;
    if (typeof title != "string" || !title) throw "invalid title";
    if (!Array.isArray(header) || !header.length) throw "invalid header";
    if (!Array.isArray(items) || !items.length) throw "invalid items";
    items.forEach((v, idx) => {
      if (!Array.isArray(v) || v.length != header.length) {
        throw "invalid items:" + idx;
      }
    });
    this._private = { title, header, items };
  }
  get title() {
    return this._private.title;
  }
  get header() {
    return this._private.header;
  }
  get items() {
    return this._private.items;
  }
};

/**
 * @param
 */
const Data = class {
  // Data가 겉에서 받아오니까 얘가 json인지 xml인지 검증해야 -> 템플릿 메소드 패턴 -> 얘가 결국 info를 넘겨줌
  async getData() {
    const json = await this._getData();
    const info = new Info(json);
    return info;
  }
  async _getData() {
    throw "getData must override";
  }
};

const JsonData = class extends Data {
  constructor(data) {
    super();
    this._data = data;
  }
  async _getData() {
    let json;
    if (typeof this._data == "string") {
      const response = await fetch(this._data);
      return await response.json();
    } else return this._data;
  }
};

const Renderer = class {
  // dom인지 먼지 몰라도 돼 -> 자식이 알아서 그림 그려줌
  constructor() {}

  async render(data) {
    // 객체 내에서는 아규먼트로 보내줄 필요없다.
    if (!(data instanceof Data)) throw "invalid data type"; // 통신은 우리가 생성한 VO 객체를 보낸다. -> 리터럴 안돼
    this._info = await data.getData();
    this._render();
  }
  _render() {
    throw "_render must be override";
  }
};

const TableRenderer = class extends Renderer {
  constructor(parent) {
    if (typeof parent != "string" || !parent) throw "invalid data type"; // 통신은 우리가 생성한 VO 객체를 보낸다. -> 리터럴 안돼
    super();
    this._parent = parent;
  } // dom 필요
  _render() {
    const parent = document.querySelector(this._parent);
    if (!parent) throw "invalid parent";
    parent.innerHTML = "";
    const [table, caption] = "table,caption"
      .split(",")
      .map(v => document.createElement(v));
    caption.innerHTML = this._info.title;
    table.appendChild(caption);
    table.appendChild(
      this._info.header.reduce(
        (thead, data) => (
          (thead.appendChild(document.createElement("th")).innerHTML = data),
          thead
        ),
        document.createElement("thead")
      )
    );
    parent.appendChild(
      this._info.items.reduce(
        (table, row) => (
          table.appendChild(
            row.reduce(
              (tr, data) => (
                (tr.appendChild(document.createElement("td")).innerHTML = data),
                tr
              ),
              document.createElement("tr")
            )
          ),
          table
        ),
        table
      )
    );
  }
};

const data = new JsonData("api.json");
const renderer = new TableRenderer("#data");
renderer.render(data);
