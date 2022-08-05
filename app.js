//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// connect mongodb with server
// mongoose.connect("mongodb://localhost:27017/todoListDB",{useNewUrlParser:true});
mongoose.connect("mongodb+srv://admin-harshita:Test123@cluster0.g1e7fyw.mongodb.net/todoListDB",{useNewUrlParser:true});

// to create a new mongoose schema
const itemSchema={name:String};

// to create a new mongoose model
const Item=mongoose.model("Item",itemSchema);

// to create a new mongoose document
const item1=new Item({name:"Welcome todo List"});
const item2=new Item({name:"Add your work here"});
const item3=new Item({name:"After completed, remove the task"});

const defaultItem=[item1,item2,item3];

const listSchema={name:String,items:[itemSchema]};

const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find({},function (err,data) {
    if(data.length===0){
          Item.insertMany(defaultItem,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("data saved success");
      }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: data});
    }
  });


});

app.get("/:work", function(req,res){
  const customListName=_.capitalize(req.params.work);
  
  List.findOne({name:customListName},function(err,foundList){
   if(!err){
    if (!foundList){
      // create a new list
       const list=new List({
          name:customListName,
          items:defaultItem
        });
        list.save();
        res.redirect("/"+customListName);
    }else{
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
    
   }
  });
 
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
const item=new Item({name:itemName});

if(listName==="Today"){
  item.save();
  res.redirect("/");
}else{
  List.findOne({name:listName},function(err,foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  });
}


});

app.post("/delete",function(req,res){
  const checkedItemId=req.body.itemName;
  const listName=req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("item deleted");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        console.log("list item deleted");
        res.redirect("/"+listName);
      }
    })
  }

  
});


app.get("/about", function(req, res){
  res.render("about");
});
// if(process.env.PORT){}

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
