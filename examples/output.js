let systemName = "People Manager";
let version = 1;
let debug = true;
/* interface Person (removed in JS) */
let admin = { name: "Raul", age: 20, email: "raul@example.com" };
function printPerson(p) {
console.log("---- Person Info ----");
console.log("Name:", p.name);
console.log("Age:", p.age);
console.log("Email:", p.email);
}
function createPerson(name, age, email) {
return { name: name, age: age, email: email };
}
printPerson(admin);
let user = createPerson("Luis", 25, "luis@example.com");
printPerson(user);
if (debug) {
console.log("Debug mode is ON");
} else {
console.log("Debug mode is OFF");
}