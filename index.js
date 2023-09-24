

import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import lodash from 'lodash';

import  dotenv from 'dotenv';
dotenv.config();

const mongodbUri = process.env.MONGODB_URI;


const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(mongodbUri, {useNewUrlParser: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Welcome to your todolist!"
});

const item2 = new Item ({

  name: "Hit the + button to add a new item."
});

const item3 = new Item ({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

let items = []; // Create an array for items


// Item.insertMany(defaultItems)
//   .then(function(){
//     console.log("Successfully saved into our DB.");
//   })
//   .catch(function(err){
//     console.log(err);
//   });

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

const day = new Date().toDateString();

  Item.find({})
  .then(function(foundItems){
    items=foundItems;
   // console.log(foundItems);
    res.render("list", {listTitle: "Today", newListItems: items});
   })
  .catch(function(err){
    console.log(err);
  })

 

});

app.get("/:customListName", function(req, res){
  const customListName = lodash.capitalize(req.params.customListName);
  console.log(customListName);
  List.findOne({name: customListName})
  .then(function(foundList){

    if (!foundList) {
     
     const list = new List({
      name: customListName,
      items: defaultItems
     });

    list.save();
     
     res.redirect("/" + customListName);
     
    }

 else 
 {
      res.render("list", {listTitle: customListName, newListItems: foundList.items});
 }
  })
  .catch(function(err){
    console.log(err);
  })
  console.log(customListName);
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = lodash.capitalize(req.body.list);

  const item = new Item
     ({
      name : req.body.newItem
     });

  if (listName === "Today") {
     item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName})
    .then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    
      })
      .catch(function(err){
      console.log(err);
    });
    
    
  }
});

app.post("/delete", function (req, res) {
  console.log(req.body);
  const listName = req.body.list;

  if (listName === "Today") {
    // Delete the item from the "Today" list
    Item.deleteOne({ _id: req.body.checkbox })
      .then(function () {
        console.log("Successfully deleted from our DB.");
        res.redirect("/");
      })
      .catch(function (err) {
        console.log(err);
      });
  } else {
    // Delete the item from a custom list
    List.findOne({ name: listName })
      .then(function (foundList) {
        // Use req.body.checkbox to find the item to remove
        foundList.items.pull({ _id: req.body.checkbox });
        foundList.save();
        res.redirect("/" + listName);
      })
      .catch(function (err) {
        console.log(err);
      });
  }
});




app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
