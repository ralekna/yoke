# yoke
JS utility to create and reuse functions bindings for safe unregistering from event dispatchers

## Example
```javascript
function add(value) {
    this + value;
}

// traditional approach
var addTwo_1 = add.bind(2);
var addTwo_2 = add.bind(2);

console.log(addTwo_1(3) + addTwo_2(1)); // 8
console.log(addTwo_1 === addTwo_2); // false - native function binding always creates new functions everytime you bind

// yoke approach
var yoke = require('yoke');

var addTwo_1 = yoke(add, 2);
var addTwo_2 = yoke(add, 2);

console.log(addTwo_1(3) + addTwo_2(1)); // 8
console.log(addTwo_1 === addTwo_2); // true - yoke saved bound function reference to its internal storage, so next time you create binding with same params it would return existing instance 
```