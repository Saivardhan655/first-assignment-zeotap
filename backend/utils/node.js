export class Node {
    constructor(type, left = null, right = null, value = null) {
        this.type = type; // "operator" or "operand"
        this.left = left;
        this.right = right;
        this.value = value; // For operand: "age > 30", operator: "AND", "OR"
    }
}