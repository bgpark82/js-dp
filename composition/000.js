const Task = class {

    constructor(title, _0 = type(title,"string")){
        this._title = err(title);
        this._list = [];
    }

    add(task, _=type(task, Task)) {
        this._list.push(task);
    }

    getResult() {
        const list = this._list;
        return {
            item : this,
            children: list.map(task => task.getResult())
        }
    }
}

const TaskItem = class extends Task{
    
    constructor(title){
        super(title);
    }
}

const TaskList = class extends Task{

    constructor(title){
        super(title)
    }
    
}



const DomRenderer = class {
    constructor(list, tag, _0 = type(list, TaskList), _1 = type(tag,HTMLElement)) {
        this._list = list;
        this._tag = tag
    }
    
    render() {
        const tag = this._tag;
        tag.innerHTML = "";
        tag.appendChild("title".split(",").reduce((acc,cur) => (
            acc.appendChild(el("button","innerHTML",cur,"@fontWeight","bold","addEventListener",["click",()=>alert("click!")])),
            acc            
        ),el("nav")));
        this._render(tag, this._list, this._list.getResult());
    }

    _render(base, list, {item, children}, _0 = type(base,HTMLElement)){
        const temp = [];
        if(item instanceof TaskList) 
            temp.push(el("h2","innerHTML",item._title))
        else {
            temp.push(
                el("h3","innerHTML",item._title),
                el("button","innerHTML","progress","addEventListener",["click",()=>alert("button!")]),
                el("button","innerHTML","delete","addEventListener",["click",()=>alert("delete!")])
            )
        }
        
        const sub = el("section","appendChild",el("input"),"appendChild",el("button","innerHTML","add","addEventListener",["click",()=>alert("add!")]))
        children.forEach(task => [this._render(sub, item, task,)]);
        temp.push(sub);
        
        temp.forEach(el => base.appendChild(el));
    }
}





const sel = (tag) => document.querySelector(tag);
const el = (tag, ...attr) => {
    const el = document.createElement(tag);
    for(let i = 0; i < attr.length;){
        const key = attr[i++];
        const value = attr[i++];
        if(typeof el[key] == "function")
            el[key](...(Array.isArray(value) ? value : [value]));
        else if(key[0] == "@") el.style[key.substr(1)] = value;
        else el[key] = value;
    }
    return el;
};
const err = (data) => {
    if(!data) throw `invalid ${data}`
    return data;
}
const type = (target, type) => {
    if(typeof target == "string"){
        if(typeof target != type) throw `invalid type ${target} : ${type}`
    } else if(!(target instanceof type)) {
         throw `invalid type ${target} : ${type}`
    }
    return target
}

const list1 = new TaskList("리스트");
const item1 = new TaskItem("아이템");
list1.add(item1);

const itemSub1 = new TaskItem("서브 아이템")
item1.add(itemSub1)

const itemSubSub1 = new TaskItem("서브 서브 아이템")
itemSub1.add(itemSubSub1);

list1.getResult(Task.title);

const todo = new DomRenderer(list1, sel("#todo"));
todo.render();


