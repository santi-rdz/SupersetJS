// variables
let name: string = "Raul";
let age: number = 21;
let student: boolean = true;

// inferfaces
interface Person {
  name: string;
  age: number;
  email: string;
}

// Object literals tipados
let admin: Person = {
  name: "Raul",
  age: 21,
  email: "raul.rodriguez39@uabc.edu.com"
};

// Funcion que imprime un Person
fn printPerson(p: Person) {
  console.log("---- Person Info ----");
  console.log("Name:", p.name);
  console.log("Age:", p.age);
  console.log("Email:", p.email);
}

// Funcion que crea un person y la retiorna
fn createPerson(name: string, age: number, email: string): Person {
  return {
    name: name,
    age: age,
    email: email
  };
}


// Imprimir admin
printPerson(admin);

// Creamos otro usuario
let user = createPerson("Luis", 25, "luis@example.com");

// Imprimirlo también
printPerson(user);

// Mensajes condicionales
if (student) {
  console.log("Hi student");
} else {
  console.log("Hi!");
}