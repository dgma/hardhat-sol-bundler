"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
const create = (initState) => {
    let _state = initState;
    const value = () => _state;
    const update = (change) => {
        if (typeof change === "function") {
            _state = change(_state);
        }
        else {
            throw new Error("only functional state change supported");
        }
    };
    return { value, update };
};
exports.create = create;
