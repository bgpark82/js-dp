const err=(v)=>{throw v};
const override = _ =>{err('override')};
const is = (c,p)=> c instanceof p;
const prop = (p, c)=> Object.assign(p,c);


const Subject = class {
    constructor(){
        // subject는 여러가지 object가짐
        this._observers = new Set();
    }
}
const Task = class extends Subject {
    constructor(_title,_date=new Date()){
        // task는 하나의 observer를 가짐
        super();
        prop(this, {_title, _date, _list:[], _observer: new TaskObserver(this)})
    };
    add(task){ 
        if(!is(task,Task)) err();
        this._list.push(task);
     };
}
const TaskItem = class extends Task {
    constructor(title, date){
        super(title, date);
        this._isComplete = false;
    }
}
const TaskList = class extends Task {
    constructor(title, date){ super(title, date); }
}


// ------------------------------------------------------------------------


const Observer = class{
    observe() {override()}
}
const Renderer = class extends Observer {
    constructor(_task,_visitor){
        super();
        prop(this,{_task,_visitor:{renderer:this}, _sort:'title'})
    }
}
const TaskObserver = class extends Observer {
    constructor(_task){
        super();
        prop(this,{_task});
    }
}
// -----------------------------------------------------------------------

const Visitor = class {
    set renderer(v) {this._renderer = v}
}
const DomVisitor = class extends Visitor {
    constructor(_parent){
        super();
        prop(this,_parent)
    }
}



const list1 = new TaskList('Title');
const item1 = new TaskItem('Item1');
list1.add(item1);
const sub1 = new TaskItem('sub1');
item1.add(sub1);
const subsub1 = new TaskItem('subsub1');
sub1.add(subsub1);

console.log(list1);
console.log(item1);
console.log(sub1);
console.log(subsub1);

const todo = new Renderer(list1, new DomVisitor('#todo'));
todo.render();