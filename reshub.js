import React from "react";
import {useLifeCycle} from 'ql-react-custom-hooks';

class ReactStateItem {
    constructor({parentId=null, id=null}={}) {
        console.log(`Creating an react state item with ${id}`);
        this.id = !Boolean(id) ? crypto.randomUUID() : id;
        this.childrenIdList = {};
        this.attachToParent(parentId);
        this.api = {};
        this.data = {};
    }
    attachToParent = (parentId) => {
        // check if the "parentId" is an element stored in the store.
        if (!Boolean(parentId) && ReactStateHub.hasOwnProperty(parentId)) {
            console.log(`attaching ${this.id} to parent ${this.parentId}.`);
            // get the element from store
            let parent = ReactStateHub[parentId];
            // add self.id to the parent childrenIdList
            parent.childrenIdList[this.id] = this.id;
            // update self.parentId
            this.parentId = parentId;
        } else {
            console.log(`parentId (${parentId}) not in the store`);
        }
    }
    detachFromParent = () => {
        if (!Boolean(this.parentId)) {
            console.log(`detaching ${this.id} from parent ${this.parentId}.`);
            // remove itself from the parent
            delete this.parentId[this.id];
            this.parentId = null;
        } else {
            console.log(`parentId is null, component has no parent`);
        }
    }

    attachToStore = () => {
        console.log(`attaching ${this.id} to state store.`);
        ReactStateHub[this.id] = this;
    }
    detachFromStore = () => {
        console.log(`detaching ${this.id} from state store.`);
        delete ReactStateHub[this.id];
    }
}



// stage 1 is used to create the reducer
const useStateItemStage1 = (initState, reducer)=>{
    const [state, dispatch] = React.useReducer(reducer, initState);
    
    return [state, dispatch];
};

// stage 2 is used to add the reducer to the store
const useStateItemStage2 = (state) => {
    useLifeCycle({
        didMount: ()=>{
            console.log(`${state.id} didMount.`);
            state.attachToStore();
        },
        willUnmount: ()=>{
            console.log(`${state.id} willUnmount.`);
            delete state.detachFromStore();
            state.detachFromParent();
        }
    });
    React.useRef(state.id);
}

const getStateObject = (stateId) => {
    if(ReactStateHub.hasOwnProperty(stateId)) {
        return ReactStateHub[stateId]
    }
    console.log("getStateObject: No state object found!");
    return null;
}

const showAllStateObjects = () => {
     Object.keys(ReactStateHub).forEach(function(key) {
        console.log(key);
        console.log(ReactStateHub[key]);
    });
    
}

const ReactStateHub = {};

const getHub = () => {
    return ReactStateHub;
}
// Reshub = react state hub
const Reshub = {
    ReactStateItem,
    getHub,
    useStateItemStage1,
    useStateItemStage2,
    getStateObject,
    showAllStateObjects,
}



// how to use
// step 1: create init state
// step 2: call useStateItemStage1 to create reducer
// step 3: define api
// step 4: call useStateItemStage2 to add reducere to the global state store

export default Reshub;


/* bugs
BUG-20220820_01
    Description
        sometimes reducer dispatch is not working. reloading webpage does not solve the problem.
        must open the page in a new tab.
    RCA - none
    Soluiton - none

*/