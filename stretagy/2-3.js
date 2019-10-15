const Github = class {
  constructor(id, repo) {
    this._base = `https://api.github.com/repos/${id}/${repo}/contents/`;
  }
  load(path) {
    if (!this._parser) return;
    const id = "callback" + Github._id++;
    const f = (Github[id] = ({ data: { content } }) => {
      delete Github[id];
      document.head.removeChild(s);
      // this._parser(content);
      console.log(this);
      this._parser[0](content, ...this._parser[1]);
    });

    const s = document.createElement("script");
    s.src = `${this._base + path}?callback=Github.${id}`;
    document.head.appendChild(s);
  }
  // set parser(v) {this._parser = v;}
  setParser(f, ...arg) {
    this._parser = [f, arg];
  }
};
Github.id = 0; // 굳이 전역일 필요는 없다.

const el = v => document.querySelector(v);
const parse = v => {};
const loader = new Github("pop8682", "js-dp");

// loader.parser = v => (el("#img").src = `data:text/plain;base64,${v}`);
const img = (v, el) => {
  console.log(el);
  el.src = `data:text/plain;base64,${v}`;
};
console.log(img);
loader.setParser(img, el("#img"));
loader.load("puppy.jpeg");
