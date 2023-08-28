const express = require("express");
const app = express();
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const url = require("url");
app.use(express.json())
dotenv.config();
const port = process.env.SERVER_PORT || 4000;
app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
const { Int32 } = require('mongodb');

//Models
const Story = mongoose.model("Story",{
  story: Array,
  upvote: Number,
  like: Boolean,
  book: Boolean,
  user: String,
  category: String
})

const Education = mongoose.model("Education",{
  story: Array,
  upvote: Number,
  like: Boolean,
  book: Boolean,
  user: String
})
const Movie = mongoose.model("Movie",{
  story: Array,
  upvote: Number,
  like: Boolean,
  book: Boolean,
  user: String
})
const Travel = mongoose.model("Travel",{
  story: Array,
  upvote: Number,
  like: Boolean,
  book: Boolean,
  user: String
})
const BookMark = mongoose.model("BookMark",{
  story: Array,
  upvote: Number,
  like: Boolean,
  book: Boolean
})
const Creator = mongoose.model("Creator", {
  user: String,
  password: String
})

const Food = mongoose.model("Food",{
  user: String,
  story: Array,
  upvote: Number,
  like: Boolean,
  book: Boolean
})
const Health = mongoose.model("Health",{
  story: Array,
  upvote: Number,
  like: Boolean,
  book: Boolean,
  user: String
})

//midleware
const isAuthenticated = (req, res, next) => {
  try {
    const user = jwt.verify(req.headers.token, process.env.JWT_SECRET) 
    req.user = user
    next();
  } catch (error) {
    res.send ({status: 'FAILED', message: 'Please login first' })
  }
}


//===Login=====
app.post('/login',async(req,res)=>{
  try{
      const {user,password}=req.body;
      const isExit=await Creator.findOne({user})
      if(!isExit)
      {  
          res.send({ status: 'FAIL', message: 'Invalid Usename'})
          return;
      }
      const didPasswordMatch=await bcrypt.compare(password, isExit.password); 
      if(didPasswordMatch){
          
          const jwtToken = jwt.sign(isExit.toJSON(), process.env.JWT_SECRET, { expiresIn: 60 });

          res.send({ status: 'SUCCESS', message: 'User logged in successfully', jwtToken })
      }
      else{
        res.send({ status: 'FAIL', message: 'Invalid Password'})
      } }
  catch(error){
      res.send({ status: 'FAILED', message: 'Failed to sign in user' })
      console.log(error)
  }

})

//====SignUP====

app.post('/register',async(req,res)=>{
  try{
   
      const {user,password}=req.body;
   
      const isExit=await Creator.findOne({user})
      
      if(isExit)
      {    
          res.send({ status: 'FAIL', message: 'User already exists'})
          return;
      }
      else {
        let encryptedPassword = await bcrypt.hash(password, 10);
        await Creator.create({ user, password: encryptedPassword })
          .then(() => {
            res.send({ status: 'SUCCESS', message: 'User register in successfully' })
          })
          .catch((err) => {
            console.log(err);
          });
      }  
    }
  catch(error){
      res.send({ status: 'FAILED', message: 'Failed to sign in user' })
      console.log(error)
  }

})


const isFilledCorrectData = (req, res, next) => {
  let { user, password } = req.body;
  if (!user || user.trim().length <= 0) {
    res.json({ status: 400, message: "Please enter valid username" });
  } else if (!password || password.trim().length <= 0) {
    res.json({ status: 400, message: "Please enter valid password" });
  } else {
    name = user;
    next();
  }
};


let checkFilledOrNot = (category, heading, desc, image) => {
  let len = 0;
  if (
    category &&
    heading[0] &&
    heading[1] &&
    heading[2] &&
    desc[0] &&
    desc[1] &&
    desc[2] &&
    image[0] &&
    image[1] &&
    image[2]
  ) {
    len = 3;
    if (heading[3] && desc[3] && image[3]) {
      len++;
      if (heading[4] && desc[4] && image[4]) {
        len++;
        if (heading[5] && desc[5] && image[5]) {
          len++;
        }
      }
    }
  }

  return len;
};

let token = "";
let name = "";

app.get("/", (req, res) => {
    res.setHeader("Access-Control-Allow-Credentials","true");
  res.json({status:'SUCCESS', message:'All Good'})
});


app.post("/api/add-story-category", (req, res) => {
  res.redirect("/api/check");
});

app.get("/api/check", (req, res) => {
  const { category, heading, desc, image, user } = req.query;
  let len = checkFilledOrNot(category, heading, desc, image);
  if (len <= 2) {
    res.json({ status: 400, message: "error" });
  } else {
    res.redirect(
      url.format({
        pathname: `/api/${category}-add-category`,
        query: {
          user: user,
          heading: heading,
          desc: desc,
          image: image,
          len: len,
        },
      })
    );
  }
});

app.get("/api/food-add-category", async (req, res) => {
  const heading = req.query.heading;
  const desc = req.query.desc;
  const image = req.query.image;
  const len = req.query.len;
  const user = req.query.user;
  let upvote = 0,
    like = false,
    book = false;

  let tempArr = [];
  for (let i = 1; i <= len; i++) {
    let obj = {};
    obj.h = heading[i - 1];
    obj.d = desc[i - 1];
    obj.i = image[i - 1];
    tempArr.push(obj);
  }

  await Food.create({ user, story: tempArr, upvote, like, book })
    .then(() => {
      res.json("Added");
    })
    .catch((err) => {
      console.log(err);
    });

  await Story.create({
    user,
    story: tempArr,
    upvote,
    like,
    book,
    category: "food",
  })
    .then(() => {
      res.json("Added");
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/api/health-add-category", async (req, res) => {
  const heading = req.query.heading;
  const desc = req.query.desc;
  const image = req.query.image;
  const len = req.query.len;
  const user = req.query.user;
  let upvote = 0,
    like = false,
    book = false;

  let tempArr = [];
  for (let i = 1; i <= len; i++) {
    let obj = {};
    obj.h = heading[i - 1];
    obj.d = desc[i - 1];
    obj.i = image[i - 1];
    tempArr.push(obj);
  }

  await Health.create({ user, story: tempArr, upvote, like, book })
    .then(() => {
      res.json("Added");
    })
    .catch((err) => {
      console.log(err);
    });
  await Story.create({
    user,
    story: tempArr,
    upvote,
    like,
    book,
    category: "health",
  })
    .then(() => {
      res.json("Added");
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/api/travel-add-category", async (req, res) => {
  const heading = req.query.heading;
  const desc = req.query.desc;
  const image = req.query.image;
  const len = req.query.len;
  const user = req.query.user;
  let upvote = 0,
    like = false,
    book = false;

  let tempArr = [];
  for (let i = 1; i <= len; i++) {
    let obj = {};
    obj.h = heading[i - 1];
    obj.d = desc[i - 1];
    obj.i = image[i - 1];
    tempArr.push(obj);
  }

  await Travel.create({ user, story: tempArr, upvote, like, book })
    .then(() => {
      res.json("Added");
    })
    .catch((err) => {
      console.log(err);
    });
  await Story.create({
    user,
    story: tempArr,
    upvote,
    like,
    book,
    category: "travel",
  })
    .then(() => {
      res.json("Added");
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/api/movie-add-category", async (req, res) => {
  const heading = req.query.heading;
  const desc = req.query.desc;
  const image = req.query.image;
  const len = req.query.len;
  const user = req.query.user;
  let upvote = 0,
    like = false,
    book = false;

  let tempArr = [];
  for (let i = 1; i <= len; i++) {
    let obj = {};
    obj.h = heading[i - 1];
    obj.d = desc[i - 1];
    obj.i = image[i - 1];
    tempArr.push(obj);
  }

  await Movie.create({ user, story: tempArr, upvote, like, book })
    .then(() => {
      res.json("Added");
    })
    .catch((err) => {
      console.log(err);
    });
  await Story.create({
    user,
    story: tempArr,
    upvote,
    like,
    book,
    category: "movie",
  })
    .then(() => {
      res.json("Added");
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/api/education-add-category", async (req, res) => {
  const heading = req.query.heading;
  const desc = req.query.desc;
  const image = req.query.image;
  const len = req.query.len;
  const user = req.query.user;
  let upvote = 0,
    like = false,
    book = false;

  let tempArr = [];
  for (let i = 1; i <= len; i++) {
    let obj = {};
    obj.h = heading[i - 1];
    obj.d = desc[i - 1];
    obj.i = image[i - 1];
    tempArr.push(obj);
  }

  await Education.create({ user, story: tempArr, upvote, like, book })
    .then(() => {
      res.json("Added");
    })
    .catch((err) => {
      console.log(err);
    });

  await Story.create({
    user,
    story: tempArr,
    upvote,
    like,
    book,
    category: "education",
  })
    .then(() => {
      res.json("Added");
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/api/get-token", (req, res) => {
  if (token.length >= 1) {
    res.json({ status: 200, token: token, name: name.user });
  } else {
    res.json({ message: "not registered/signin yet!" });
  }
});

app.get("/api/food-get-stories", async (req, res) => {
  console.log('came')
  let docs = await Food.find();
  let oArr = [];
  let ids = [];
  let upvotesCount = [];
  let liked = [];
  let book = [];

  docs.map((doc) => {
    let iArr = [];
    doc.story.map((story) => {
      iArr.push(story);
    });
    oArr.push(iArr);
  });

  docs.map((doc) => {
    ids.push(doc._id);
  });

  docs.map((doc) => {
    upvotesCount.push(doc.upvote);
  });

  docs.map((doc) => {
    liked.push(doc.like);
  });

  docs.map((doc) => {
    book.push(doc.book);
  });

  res.json({ oArr, ids, upvotesCount, liked, book });
});

app.get("/api/health-get-stories", async (req, res) => {
  let docs = await Health.find();
  let oArr = [];
  let ids = [];
  let upvotesCount = [];
  let liked = [];
  let book = [];

  docs.map((doc) => {
    let iArr = [];
    doc.story.map((story) => {
      iArr.push(story);
    });
    oArr.push(iArr);
  });

  docs.map((doc) => {
    ids.push(doc._id);
  });

  docs.map((doc) => {
    upvotesCount.push(doc.upvote);
  });

  docs.map((doc) => {
    liked.push(doc.like);
  });

  docs.map((doc) => {
    book.push(doc.book);
  });

  res.json({ oArr, ids, upvotesCount, liked, book });
});

app.get("/api/travel-get-stories", async (req, res) => {
  let docs = await Travel.find();
  let oArr = [];
  let ids = [];
  let upvotesCount = [];
  let liked = [];
  let book = [];

  docs.map((doc) => {
    let iArr = [];
    doc.story.map((story) => {
      iArr.push(story);
    });
    oArr.push(iArr);
  });

  docs.map((doc) => {
    ids.push(doc._id);
  });

  docs.map((doc) => {
    upvotesCount.push(doc.upvote);
  });

  docs.map((doc) => {
    liked.push(doc.like);
  });

  docs.map((doc) => {
    book.push(doc.book);
  });

  res.json({ oArr, ids, upvotesCount, liked, book });
});

app.get("/api/education-get-stories", async (req, res) => {
  let docs = await Education.find();
  let oArr = [];
  let ids = [];
  let upvotesCount = [];
  let liked = [];
  let book = [];

  docs.map((doc) => {
    let iArr = [];
    doc.story.map((story) => {
      iArr.push(story);
    });
    oArr.push(iArr);
  });

  docs.map((doc) => {
    ids.push(doc._id);
  });

  docs.map((doc) => {
    upvotesCount.push(doc.upvote);
  });

  docs.map((doc) => {
    liked.push(doc.like);
  });

  docs.map((doc) => {
    book.push(doc.book);
  });

  res.json({ oArr, ids, upvotesCount, liked, book });
});

app.get("/api/movie-get-stories", async (req, res) => {
  let docs = await Movie.find();
  let oArr = [];
  let ids = [];
  let upvotesCount = [];
  let liked = [];
  let book = [];

  docs.map((doc) => {
    let iArr = [];
    doc.story.map((story) => {
      iArr.push(story);
    });
    oArr.push(iArr);
  });

  docs.map((doc) => {
    ids.push(doc._id);
  });

  docs.map((doc) => {
    upvotesCount.push(doc.upvote);
  });

  docs.map((doc) => {
    liked.push(doc.like);
  });

  docs.map((doc) => {
    book.push(doc.book);
  });

  res.json({ oArr, ids, upvotesCount, liked, book });
});

app.get("/api/update-like", async (req, res) => {
  const { id, upvote, like, category, book } = req.query;
  // console.log(id,upvote,like);
  switch (category) {
    case "food":
      await Food.findByIdAndUpdate({ _id: id }, { upvote, like, book })
        .then(() => {
          res.json("updated");
        })
        .catch((err) => {
          console.log(err);
        });
      break;

    case "health":
      await Health.findByIdAndUpdate({ _id: id }, { upvote, like, book })
        .then(() => {
          res.json("updated");
        })
        .catch((err) => {
          console.log(err);
        });
      break;

    case "book":
      await BookMark.findByIdAndUpdate({ _id: id }, { upvote, like, book })
        .then(() => {
          res.json("updated");
        })
        .catch((err) => {
          console.log(err);
        });
      break;

    case "travel":
      await Travel.findByIdAndUpdate({ _id: id }, { upvote, like, book })
        .then(() => {
          res.json("updated");
        })
        .catch((err) => {
          console.log(err);
        });
      break;
    case "education":
      await Education.findByIdAndUpdate({ _id: id }, { upvote, like, book })
        .then(() => {
          res.json("updated");
        })
        .catch((err) => {
          console.log(err);
        });
      break;
    case "movie":
      await Movie.findByIdAndUpdate({ _id: id }, { upvote, like, book })
        .then(() => {
          res.json("updated");
        })
        .catch((err) => {
          console.log(err);
        });
      break;

    case "story":
      await Story.findByIdAndUpdate({ _id: id }, { upvote, like, book })
        .then(() => {
          res.json("updated");
        })
        .catch((err) => {
          console.log(err);
        });
      break;
    default:
      break;
  }
});

app.get("/api/save-bookmark", async (req, res) => {
  const { story, book, like, upvote } = req.query;
  // console.log(story,book,like,upvote);
  await BookMark.create({ story, book, like, upvote })
    .then(() => {
      res.json("added");
    })
    .then((err) => {
      console.log(err);
    });
});

app.get("/api/get-bookmarks", async (req, res) => {
  let docs = await BookMark.find();
  // console.log(docs);
  let oArr = [];
  let ids = [];
  let upvotesCount = [];
  let liked = [];
  let book = [];

  docs.map((doc) => {
    let iArr = [];
    doc.story.map((story) => {
      iArr.push(story);
    });
    oArr.push(iArr);
  });

  docs.map((doc) => {
    ids.push(doc._id);
  });

  docs.map((doc) => {
    upvotesCount.push(doc.upvote);
  });

  docs.map((doc) => {
    liked.push(doc.like);
  });

  docs.map((doc) => {
    book.push(doc.book);
  });

  res.json({ oArr, ids, upvotesCount, liked, book });
});

app.get("/api/delete-bookmark", async (req, res) => {
  const { id } = req.query;
  await BookMark.findByIdAndDelete({ _id: id })
    .then(() => {
      res.json("deleted bookmark");
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/api/story-get-stories", async (req, res) => {
  // console.log("called");
  const { user } = req.query;
  let docs = await Story.find({ user });
  let oArr = [];
  let ids = [];
  let upvotesCount = [];
  let liked = [];
  let book = [];

  docs.map((doc) => {
    let iArr = [];
    doc.story.map((story) => {
      iArr.push(story);
    });
    oArr.push(iArr);
  });

  docs.map((doc) => {
    ids.push(doc._id);
  });

  docs.map((doc) => {
    upvotesCount.push(doc.upvote);
  });

  docs.map((doc) => {
    liked.push(doc.like);
  });

  docs.map((doc) => {
    book.push(doc.book);
  });

  res.json({ oArr, ids, upvotesCount, liked, book });
  // res.json({d1});
});

app.get("/api/get-story/:id", async (req, res) => {
  const { id } = req.params;
  let docs = await Story.findById({ _id: id });
  let cat = docs.category;
  docs = docs.story;
  res.json({ docs, cat });
});

app.get("/api/edit-story/:id", async (req, res) => {
  const { category, heading, desc, image, user } = req.query;
  const { id } = req.params;

  let len = checkFilledOrNot(category, heading, desc, image);
  if (len <= 2) {
    res.json({ status: 400, message: "error" });
  } else {
    let tempArr = [];
    for (let i = 1; i <= len; i++) {
      let obj = {};
      obj.h = heading[i - 1];
      obj.d = desc[i - 1];
      obj.i = image[i - 1];
      tempArr.push(obj);
    }
    await Story.findByIdAndUpdate(
      { _id: id },
      { story: tempArr, category: category }
    )
      .then(() => {
        res.json("Edited");
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

app.listen(port, () => {
  mongoose
    .connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connected to Database");
      console.log(`Server running on port ${port}`);
    })
    .catch(() => {
      console.log("Could not connect");
    });
});
