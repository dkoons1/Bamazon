var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "joji",

  // Your password
  password: "trilogy1",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  queryAllProducts();
  start();
});

function start() {
    inquirer
      .prompt([{
        type: "input",
        name: "id",
        message: "What is the ID of the product you'd like to purchase?",
        validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            }
            return false;
          }
      },
      {
        type: "input",
        name: "howmany",
        message: "How many units would you like to buy?",
        validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            }
            return false;
          }
      }
    ])
      .then(function(answer) {
        // based on their answer, either call the bid or the post functions
        var product_id = answer.id;
        var product_units = answer.howmany;
        var itemQuery = 'SELECT * FROM bamazon.products WHERE ?';

        connection.query(itemQuery, {id: product_id}, function(err, data){
            if (err) throw err;

            if (data.length === 0){
                console.log('There is no product with that ID value.');
                queryAllProducts();
            }
            else {
                var productList = data[0];
                if(product_units <= productList.stock_quantity){
                    console.log("We have this item in stock. We will place your order now.")
                    var queryUpdate = "UPDATE products SET stock_quantity = " + (productList.stock_quantity - product_units) + " WHERE id = " + product_id;
                    connection.query(queryUpdate, function(err, data){
                        if (err) throw err;
                        console.log("Your total is $" + productList.price * product_units)
                        connection.end();
                    })
                }
                else{
                    console.log("There is not enough stock of that item. Thank you.")
                    queryAllProducts();
                }
            }
        })
      });
  }

function queryAllProducts() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    for (var i = 0; i < res.length; i++) {
      console.log(res[i].product_name + " | " + res[i].department_name + " | " + res[i].price + " | " + res[i].stock_quantity);
    }
    console.log("-----------------------------------");
  });
}