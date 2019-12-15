

// 1. 만들기 쉬운 Entity 먼저 생성
const Task = class {
    constructor(title, date){
        // 은닉
        if(!title) throw "invalid title";
        this._title = title;
        this._date = date;
        this._isComplete = false;
        // Task도 자식을 가지는 형태로 바뀌었다.
        this._list = [];
    }

    // Task의 sub리스트를 추가
    add(title, date = Date.now()) {
        this._list.push(new Task(title, date));
    }

    isComplete(){
        return this._isComplete
    }

    // 정렬기준은 Task가 가지고 있으므로 Task에 책임이 있다 
    // 현재의 Task과 다른 Task를 비교
    // 얘는 어쨌든 정렬했으니까 책임을 다했다.
    sortTitle(task) {
        return (this._title > task._title) ? 1 : -1;
    }

    sortDate(task) {
        return (this._title > task._title) ? 1 : -1;
    }

    _getList(sort, stateGroup){
        const list = this._list;
        const s = taskSort[sort]
        return {
            task:this,
            sub:!stateGroup 
        // 데이터값을 수정할 떄는 리스트를 복사해서 사용
        // 원본데이터를 보존 할 수 있다.
        ? [...list].sort(s) 
        : [...list.filter(v => v.isComplete()).sort(s),
           ...list.filter(v => !v.isComplete()).sort(s)]}
    }
}

const TaskList = class {
    constructor(title) {
        if(!title) throw "invalid title"
        this._title = title;
        this._list = [];
    }

    add(title, date = Date.now()) {
        this._list.push(new Task(title, date));
    }

    // array 함수를 사용하는 순간 내용물은 Task가 된다.
    // Task를 구하게 되면 나머지는 Task의 책임이 된다.
    // 
    byDate(stateGroup = true){
        return this._getList("date")
    }

    byTitle(stateGroup = true) {
        return this._getList("title")
    }

    _getList(sort, stateGroup){
        const list = this._list;
        const s = taskSort[sort]
        return (!stateGroup 
        // 데이터값을 수정할 떄는 리스트를 복사해서 사용
        // 원본데이터를 보존 할 수 있다.
        ? [...list].sort(s) 
        : [...list.filter(v => v.isComplete()).sort(s),
           ...list.filter(v => !v.isComplete()).sort(s)]).map(v => v._getList());
    }
}

const taskSort = {
    "title" : (a,b)=> a.sortTitle(b),
    "date" : (a,b)=> a.sortDate(b),
}

const list1 = new TaskList("코드스피츠 80");
list1.add("템플릿 패턴");
list1.add("컴포지트 패턴")
list1.add("빌드 패턴")
list1.byDate();
const list2 = new TaskList("코드스피츠 85");
list2.add("지라 설치");
list2.add("지라 클라우드 접속")
list2.add("지라 종료")
list2.byTitle();
console.log(list1)
// 원본을 보존한 형태
// byTitle() 실행한 값만 달라진다.
// 결국 다른 값만 보여준 것
console.log(list2)
console.log(list2.byTitle())