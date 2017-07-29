var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  user: "root",

  password: "Gorgine1427",
  database: "bamazon_DB"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;

  start();
});


function start() {
  inquirer
    .prompt({
      name: "addAndQuantity",
      type: "rawlist",
      message: "Would you like to [ADD] an item? Enter [BUY] to purchase?",
      choices: ["ADD", "BUY"]
    })
    .then(function(answer) {

      if (answer.addAndQuantity.toUpperCase() === "ADD") {
        addAction();
      }
      else {
        buyAction();
      }
    });
}


function addAction() {
  inquirer
    .prompt([
      {
        name: "item",
        type: "input",
        message: "What is the item you would like to add?"
      },
      {
        name: "department",
        type: "input",
        message: "What department would you like to add your item to?"
      },
      {
        name: "quantity",
        type: "input",
        message: "How many would you like to add?",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      }
    ])
    .then(function(answer) {

      connection.query(
        "INSERT INTO products SET ?",
        {
          item_name: answer.item_id,
          product_name: answer.productname,
          dept_name: answer.departmentname,
          price: answer.price
          //stock_quantity: ansewer.quantity,
        },
        function(err) {
          if (err) throw err;
          console.log("Your inentory was completed!");

          start();

        }
      );
    });
}

function buyAction() {
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "choice",
          type: "rawlist",
          choices: function() {
            var choiceArray = [];
            for (var i = 0; i < results.length; i++) {
              choiceArray.push(results[i].product_name);
            }
            return choiceArray;
          },
          message: "What would you like to buy?"
        },
        {
          name: "quantity",
          type: "input",
          message: "How much would you like to buy?"
        }
      ])
      .then(function(answer) {

        var chosenItem;
        for (var i = 0; i < results.length; i++) {
          if (results[i].product_name === answer.choice) {
            chosenItem = results[i];
          }
        }


        if (chosenItem.price > parseInt(answer.quantity)) {

          connection.query(
            "UPDATE quantity SET ? WHERE ?",
            [
              {
                quantity: answer.quantity
              },
              {
                id: chosenItem.id
              }
            ],
            function(error) {
              if (error) throw err;
              console.log("purchase placed successfully!");
              start();
            }
          );
        }
        else {

          console.log("Insufficient quantity!");
          start();
        }
      });
  });
}
