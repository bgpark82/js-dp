const Task = class {
    constructor(title){
        this._title = title;
        this._date = new Date();
        // 은닉
        this._isComplete = false;
    }

    // 캡슐화 : _isComplete은 외부에 보여져서는 안된다.
    isComplete(){
        return this._isComplete;
    }

    toggle(){
        this._isComplete = !this._isComplete;
    }

    // title의 state는 Task가 가지고 있으므로 정렬하는 것도 Task의 책임
    sortTitle(task){
        return this._title > task._title ? 1 : -1;
    };

    sortDate(task){
        return this._date > task._date ? 1 : -1;
    }
}

const sortFactory = {
    "title": (a,b) =>  a.sortTitle(b),
    "date": (a,b) => a.sortDate(b)
}


const TaskList = class {
    constructor(title){
        this._title = title;
        this._list = [];
    }

    add(title){
        return this._list.push(new Task(title))
    }

    byTitle(stateGroup=true){
        return this._getSort("title", stateGroup)
    }

    byDate(stateGroup=true) {
        return this._getSort("date", stateGroup)
    }

    // refactoring
    _getSort(criteria, stateGroup){
        const list = this._list
        const s = sortFactory[criteria];
        return !stateGroup ?
        [...list].sort(s) :
        [...list.filter(t => !t.isComplete()).sort(s),
        ...list.filter(t => t.isComplete()).sort(s)]
    }
}



const t1 = new TaskList("리스트 제목");
t1.add("3")
t1.add("1")
t1.add("2")
console.log(t1.byTitle())
console.log(t1);


