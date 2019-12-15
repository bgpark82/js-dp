const Task = class {

    static title(a, b){return a.sortTitle(b)}
    static date(a, b){return a.sortDate(b)}

    constructor(title){
        if(!title) throw "invalid title"
        this._title = title;
        this._list = [];
    }

    // 이전과 다르게 객체 자체가 날라옴
    add(task){
        if(task instanceof Task) this._list.push(task);
        else throw "invalid"
    }

    remove(task){
        const list = this._list;
        if(list.includes(task)) list.splice(list.indexOf(task),1)
    }

    // sort한 객체를 리턴
    getResult(sort, stateGroup){
        const list = this._list;
        return {
            item: this,
            children: (
                !stateGroup
                ? [...list.sort(sort)]
                : [...list.filter(v=>v.isComplete()).sort(sort),
                   ...list.filter(v=>!v.isComplete()).sort(sort)]
            ).map(v => v.getResult(sort, stateGroup))
        }
    }
}

const TaskItem = class extends Task{
    constructor(title, date = new Date()){
        super(title)
        this._date = date;
        this._isComplete = false;
    }       


    isComplete() {return this._isComplete}
    sortTitle(task) {return (this._title > task._title) ? 1 : -1}
    sortDate(task) {return (this._date > task._date) ? 1 : -1}
    toggle() {this._isComplete = !this._isComplete}
}

const TaskList = class extends Task {
    constructor(title){super(title);}
    sortTitle() {return this};
    sortDate() {return this};
}

// 인메모리 객체와 네이티브 객체가 함께
const DomRenderer = class {
    constructor(list, parent) {
        // 1. 인메모리 객체 
        this._list = list;
        // 2. 네이티브 객체
        this._parent = parent
        this._sort = Task.title
    }

    // 하위 자식 추가
    add(parent, title, date){
        parent.add(new TaskItem(title, date))
        this.render();
    }

    // 네이티브의 책임이므로 네이티브에서 해결
    // 내부적으로는 인메모리를 호출하여 해결
    toggle(task){
        if(task instanceof TaskItem){
            task.toggle()
            // 모든 이벤트에 대해 render();
            this.render()
        }
    }

    // 네이티브 -> 인메모리
    remove(parent, task){
        // 전체 데이터에서 task부분만 제거
        parent.remove(task)
        this.render()
    }

    render(){
        // parent만 생성
        const parent = this._parent;
        parent.innerHTML = "";
        parent.appendChild("title,date".split(",")
            .reduce((nav, cur)=>(nav.appendChild(
                el("button",
                "innerHTML",cur,
                "@fontWeight", this._sort == cur ? "bold" : "normal",
                "addEventListener",["click", e=>(Task[cur], this.render())])
            ),nav),el("nav"))
        );
        // _render 호출 = 실제로 데이터를 넣어서 렌더링 될 곳
        this._render(parent, this._list, this._list.getResult(this._sort),0)
        // parent : 베이스가 되는 dom
        // _list : 최종 리스트 객체
        // _list.getResult : 정렬된 리스트 객체
    }

    // item : 현재 todo
    // chidlren : 현재 아이템의 리스트 
    _render(base, parent, {item, children}, depth){
        // list에 element 다 넣어서 출력
        const temp = [];
        // base 태그를 오른쪽으로 밀어냄
        base.style.paddingLeft = depth * 10 + "px";

        // 1. 현재 todo 아이템 render 준비
        if(item instanceof TaskList) {
            temp.push(el("h2",'innerHTML',item._title))
        } else {
            temp.push(
                el("h3",
                    "innerHTML",item._title,
                    "@textDecoration", item.isComplete() ? 'line-through':'none' ),
                el('time',
                'innerHTML',item._date.toString(),
                'datetime',item._date.toString()),
                el('button',
                'innerHTML',item.isComplete() ? "progress" : "complete",
                "addEventListener",['click', _=> this.toggle(item)]),
                el('button',
                'innerHTML','remove',
                'addEventListener',['click', _=> this.remove(parent, item)])
            )
        }
        const sub = el("section",
        'appendChild',el('input','type','text'),
        'appendChild',el('button',
            'innerHTML','add',
            'addEventListener',['click',e => this.add(item, e.target.previousSibling.value)]));
        
        temp.push(sub);
        temp.forEach(v => base.appendChild(v))
        // 2. 자식 리스트 render
        children.forEach(v => this._render(sub, item, v, depth+1))
    }
}


const sel =(tag)=>{ return document.querySelector(tag)}
const el =(tag, ...attr)=>{
    const el = document.createElement(tag);
    for(let i = 0; i < attr.length;){
        const k = attr[i++]
        const v = attr[i++]
        // div.addEventListener = function()
        if(typeof el[k] == "function") el[k](...(Array.isArray(v) ? v : [v]))
        else if(k[0] == "@") el.style[k.substring(1)] = v;
        else el[k] = v;
    }
    return el;
}



const list1 = new TaskList("코드스피츠 80");
const item2 = new TaskItem("2강. 자바스크립트 OOP")
list1.add(item2)
const item1 = new TaskItem("1강. 자바스크립트 개요")
list1.add(item1);
const sub1 = new TaskItem("1-1. 자바스크립트 함수");
item1.add(sub1);
const subsub1 = new TaskItem("1강 사이드노트");
sub1.add(subsub1);
console.log(list1)

list1.getResult(Task.title)
console.log(list1)

console.log(new DomRenderer(list1, sel("#todo")))
new DomRenderer(list1, sel("#todo")).render();