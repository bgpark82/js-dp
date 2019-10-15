const Table = (_ => {
  // 테이블이 데이터 로딩에 책임을 지고있네? 왜 테이블이 지고있지? => 역할에 따라 나누어라
  // static private
  const Private = Symbol();

  return class {
    constructor(parent) {
      if (typeof parent != "string" || !parent) throw "invalid param";
      this[Private] = { parent: parent };
    }
    load(url) {
      // 1. 데이터 로딩 -> 여기 있으면 안되지 -> 만약 함수가 바뀌면 어쩔 건데?
    }
    _render() {
      // 2. 렌더링
    }
  };
})();

// const loader = new Loader("api.json"); // 밖에거 (쓸 것) 먼저 짠다. -> 최종적으로 하는 일이 자신의 역할
// loader.load(json => {
//   // 1. 로더는 json 받아서 object 보내주는 역할 -> object를 검증해야지 -> 안정성이 검증된 -> VO : value object : 검증이 잘된 객체라는 표시 -> 그냥 사용해도됨
//   const renderer = new renderer(); // 2. 렌더러는 object 받아서 dom에게 뿌리는 역할
//   renderer.setData(json);
//   renderer.render();
// });

/**
 *
 * @param {*} json
 * @return {*} valid json
 */
const Info = class {
  // VO -> 프로토콜 -> 이제 객체 내의 모든 프로퍼티들은 존재함을 검증
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

const Data = class {
  // Data가 겉에서 받아오니까 얘가 json인지 xml인지 검증해야 -> 템플릿 메소드 패턴 -> 얘가 결국 info를 넘겨줌
  async getData() {
    throw "getData must override";
  }
};

const JsonData = class extends Data {
  constructor(data) {
    super();
    this._data = data;
  }

  async getData() {
    let json;
    if (typeof this._data == "string") {
      const response = await fetch(this._data);
      return await response.json();
    } else json = this._data;
    return new Info(json);
  }
};

const Renderer = class {
  // 타입만 받아서 판단 -> 타입으로 if문 없앨 수도
  constructor() {}

  async render(data) {
    if (!(data instanceof Data)) throw "invalid data type"; // 통신은 우리가 생성한 VO 객체를 보낸다. -> 리터럴 안돼
    const info = await data.getData();
    console.log(info);
  }
};

const data = new JsonData("api.json"); // 이름이 너무 구체적으로 된다면 추상화를 의심해봐야 한다.
const renderer = new Renderer(); // 역할을 나누고 역할간의 통신
renderer.render(data);

const table = new Table("#data");
