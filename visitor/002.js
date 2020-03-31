const Task = class {
    constructor(title, _0=type(title,"string")){
        this._title = valid(title);
        this._list = [];
    }
    add(task, _0=type(task,TaskItem)) {
        this._list.push(task);
    }
    getTask(){
        return {
            item : this,
            children: this._list.map(item => item.getTask())
        }
    }
    accept(visitor, _0=type(visitor,Visitor)){
        visitor.start(this);
        this.getTask().children.forEach(({item}) => item.accept(visitor));
        visitor.end();
    }
    isComplete(){override()}

}
const TaskList = class extends Task{
    constructor(title) {
        super(title);
    }
    isComplete(){}
}
const TaskItem = class extends Task{
    constructor(title){
        super(title);
        this._isComplete = false;
    }
    isComplete() { return this._isComplete}
    toggle() { this._isComplete = !this._isComplete}
}

// 데이터 변경하고 렌더링
const Renderer = class { 
    constructor(taskList, visitor, _0=type(taskList,TaskList), _1=type(visitor,Visitor)){
        this._taskList = valid(taskList);
        this._visitor = Object.assign(visitor,{renderer:this});
    }
    render(){
        this._visitor.reset();
        this._taskList.accept(this._visitor);
    }
    add(task, title,_0=type(task,Task)){
        task.add(new TaskItem(title)); // 데이터 주입
        this.render() // 초기화 하고 실행
    }
    toggle(task, _0=type(task,Task)){
        task.toggle();
        this.render();
    }
}

const Visitor = class {
    set renderer(v) {this._renderer = v;}
    reset(){override()}
    start(task){override()}
    end(){override()}
}
const DomVisitor = class extends Visitor {
    constructor(parent,_0=type(parent,"string")){
        super();
        this._parent = valid(parent);
    }
    reset(){
        this._current = el(sel(this._parent),"innerHTML","");
    }
    start(task, _0=type(task,Task)){
        this._current.appendChild(el("div","innerHTML",task._title,"@textDecoration",task.isComplete() ? "line-through":"",
            "appendChild",el("button","innerHTML","toggle","addEventListener",["click",_=> this._renderer.toggle(task)])))
        this._current.appendChild(el("section",
            "appendChild",el("input","type","text"),
            "appendChild",el("button","innerHTML","add","addEventListener",["click", e=>{
                this._renderer.add(task,e.target.previousSibling.value) // controller로 데이터 보내기
            }])))
    }
    end(){
        this._current = this._current.parentNode;
    }
}


const list = new TaskList("list");
const item = new TaskItem("item");
list.add(item);
const sub = new TaskItem("sub");
item.add(sub);
const subsub = new TaskItem("subsub");
sub.add(subsub);

const renderer = new Renderer(list, new DomVisitor("#todo"));
renderer.render();

