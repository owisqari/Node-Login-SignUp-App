const app = require("express")();
const url = require("mongoose");
const BlogsDB = require("./modules/Blogs");
const UsersDB = require("./modules/Users");
const BankDB = require("./modules/BankAccount");
const TagsDB = require("./modules/Tags");
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));

url
  .connect(
    "mongodb+srv://admin:admin@cluster0.e0ld66h.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.log("Cannot connect to the database", err);
  });

//config ejs
app.set("view engine", "ejs");
app.set("views", "./views");

app.get("/", (req, res) => {
  UsersDB.find()
    .then((users) => {
      BlogsDB.find()
        .then((blogs) => {
          res.render("home.ejs", {
            user: users,
            blog: blogs,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/createUsers", (req, res) => {
  UsersDB.find()
    .then((data) => {
      res.render("createUsers.ejs", { user: data });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/createUsers", (req, res) => {
  const newUser = new UsersDB({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
  });
  newUser
    .save()
    .then(() => {
      res.redirect("/createBlogs");
    })
    .catch((err) => {
      console.log(err);
    });
});

// rendring create users form
app.get("/createBlogs", (req, res) => {
  TagsDB.find()
    .then((Tagdata) => {
      BlogsDB.find()
        .then((Blogdata) => {
          res.render("createBlogs.ejs", {
            blog: Blogdata,
            tag: Tagdata,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/createBlogs/:id", (req, res) => {
  const author = req.params.id;
  const newBlog = new BlogsDB({
    title: req.body.title,
    body: req.body.model,
    author: author,
  });
  newBlog
    .save()
    .then((savedBlog) => {
      UsersDB.findById(author)
        .then((user) => {
          user.userBlogs.push(savedBlog._id);
          user
            .save()
            .then(() => {
              res.redirect("/");
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});
//displaying blog details
app.get("/blogDetail/:id", (req, res) => {
  UsersDB.findById(req.params.id)
    .then((user) => {
      BlogsDB.findById(user.userBlogs[0])
        .then((data) => {
          res.render("blogDetails.ejs", { blog: data });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

//deleting blog
app.get("/blogDelete/:id", (req, res) => {
  BlogsDB.findByIdAndDelete(req.params.id)
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
});

//updating blog
app.get("/blogUpdate/:id", (req, res) => {
  BlogsDB.findById(req.params.id)
    .then((data) => {
      res.render("blogUpdate.ejs", { blog: data });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/blogUpdate/:id", (req, res) => {
  BlogsDB.findByIdAndUpdate(req.params.id, {
    title: req.body.title,
    body: req.body.body,
  })
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/CreatebankAccount/:id", (req, res) => {
  UsersDB.findById(req.params.id)
    .then(() => {
      res.render("createBankAccount.ejs");
    })
    .catch((err) => {
      console.log(err);
    });
});
app.post("/CreatebankAccount/:id", (req, res) => {
  const userId = req.params.id;
  const newAccount = new BankDB({
    accountNum: req.body.accountNum,
    amount: req.body.amount,
  });
  newAccount
    .save()
    .then((savedAccount) => {
      UsersDB.findById(req.params.id)
        .then((user) => {
          user.userAccount = savedAccount._id;
          user
            .save()
            .then(() => {
              res.redirect("/");
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

const port = process.env.PORT || 8080;
//testing port 8080
app.listen(port, () => {
  console.log("Server is running on port 8080");
});
