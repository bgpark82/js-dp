const Task = class {
    constructor(title, _=type(title,"string")){
        this._title = title;
        this._list = [];
    }
    add(task, _=type(task,TaskItem)){
        this._list.push(task);
    }
    getTask(){
        return {
            item : this,
            children : this._list.map(task => task.getTask())
        }
    }
    accept(visitor, _=type(visitor, DomVisitor)){
        visitor.start(this);
        const children = this.getTask().children
        children.forEach(({item}) => item.accept(visitor))
        visitor.end();
    }
}
const TaskList = class extends Task{
    constructor(title){
        super(title);
    }
};
const TaskItem = class extends Task{
    constructor(title){
        super(title);
    }
};

const Renderer = class {
    constructor(taskList, visitor, _0=type(taskList, TaskList),_1=type(visitor, DomVisitor)){
        this._taskList = taskList;
        this._visitor = visitor;
    }
    render(){
        this._visitor.reset();
        this._taskList.accept(this._visitor);
    }
};

const Visitor = class {};
const DomVisitor = class {
    constructor(parent){
        this._parent = parent;
    }
    reset(){
        this._current = el(sel(this._parent),'innerHTML','');
    }
    start(task, _=type(task,Task)){
        this._current = this._current.appendChild(el('div','innerHTML',task._title))
    }
    end(){
        this._current = this._current.parentNode;
    }
};




const list1 = new TaskList("list");
const item1 = new TaskItem("item");
list1.add(item1);

const sub1 = new TaskItem("sub");
item1.add(sub1);

const subsub1 = new TaskItem("subsub");
sub1.add(subsub1);

const renderer = new Renderer(list1, new DomVisitor("#todo"));
renderer.render();