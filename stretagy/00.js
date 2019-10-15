const Github = class {
  constructor(id, repo) {
    this._base = `https://api.github.com/repos/${id}/${repo}/contents/`;
  }
  load(url) {
    const id = "callback" + Github._id++; // img
    const f = (Github[id] = ({ data: { content } }) => {
      delete Github[id];
      document.head.removeChild(s);
      this._parser(content);
    });
    const s = document.createElement("script"); // head
    console.log(id);
    s.src = `${this._base + url}?callback=Github.${id}`;
    document.head.appendChild(s);
  }
  set parser(v) {
    this._parser = v;
  }
};
Github._id = 0;

const el = v => document.querySelector(v);

const loader = new Github("pop8682", "js-dp");
// 우리가 원하는 함수를 set 해줌
loader.parser = v => (el("#img").src = `data:text/plain;base64,${v}`); // img
loader.load("puppy.jpeg"); // head
console.dir(loader);
