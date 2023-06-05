const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const app=express();
const _=require("lodash");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("public"))
const workItems=[];

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB",  {useNewUrlParser: true, useUnifiedTopology: true})

const itemSchema={
    name: String,
};

const Item=mongoose.model("Item", itemSchema);

const item1=new Item({
    name:"Welcome to your to do list"
});

const item2=new Item({
    name:"Add new items by using the + button"
});

const item3=new Item({
    name:"<--- Hit this to delete an item"
});

const defaultItems=[item1, item2, item3];

const listSchema={
    name: String,
    items: [itemSchema]
};

const List=mongoose.model("List", listSchema);

app.get("/", function(req, res){
    Item.find({}).then(function(foundItems){
        if(foundItems.length===0){
            Item.insertMany(defaultItems).then(function(err){
                console.log("Successfully saved default items to DB");
            })
            res.redirect("/");
        }else{
            res.render("list", {listTitle: "Today", newListItems: foundItems});
        }
    });    
});

app.post("/", function(req, res){
    const itemName=req.body.newItem;
    const listName=req.body.list;
    const item=new Item({
        name: itemName
    });
    if(listName==="Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name:listTitle}).then(function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        })
    }
});

app.post("/delete", function(req, res){
    const checkedItemId=req.body.checkbox;
    const listName=req.body.listName;
    if(listName==="Today"){
        Item.findByIdAndRemove(checkedItemId).then(function(err){
            if(!err){
                console.log("Item removed");
                res.redirect("/");
            }
        })
    }else{
        List.findOneAndUpdate({name: listName}, {$pull:{items:{_id:checkedItemId}}}).then(function(err, foundList){
            if(!err){
                res.redirect("/"+listName);
            }
        })
    }
})

app.get("/:customListName", function(req, res){
    const customListName=_.capitalize(req.params.customListName);
    List.findOne({name:customListName}).then(function(err, foundList){
        if(!err){
            if(!foundList){
                const list=new List({
                    name:customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/:customListName")
            }else{
                res.render("list", {listTitle: foundList.name, newListItems:foundList.items});
            }
        }
    })
})

app.listen(3000, function(){
    console.log("We out here at 3000");
})