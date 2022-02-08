const {initializeApp,getApps, cert } = require('firebase-admin/app');
const {getFirestore} = require('firebase-admin/firestore');
const credentials = require('./credentials.json');

initializeApp({
    credential: cert(credentials)
});

const express = require("express")
const app= express()
app.use(express.json())

const db = connectToFirestore();

function connectToFirestore(){
    if(!getApps().length){
        initializeApp({
            credential: cert(credentials)
        });
    } return getFirestore();
}

app.get('/', (req, res) => {
    const db = connectToFirestore();
    res.send('Hello World')
});

const getProduceCollection = (db) => {
    const col = db.collection('produce');
    return col
}

const insertProduce = async (produce) => {
    const db = connectToFirestore();
    const col = getProduceCollection(db);
    const res = await col.add(produce);
    console.log("Produce Added")
};

app.post('/produce', async ( request, response) => {
    const db = connectToFirestore();
    const produce = request.body;
    await insertProduce(produce);
    response.send(`succesfully inserted produce: ${JSON.stringify(produce)}`);
  });

const dairyRef = db.collection("dairy")

app.post("/dairy", (req, res) => {
    const db = connectToFirestore();
    dairyRef
        .add(req.body)
        .then(() => res.send("Dairy product added"))
        .catch(console.error)
});

app.get("/dairy/:dairyId", (req, res) => {
    const {dairyId} = req.params;
    const db = connectToFirestore();
    dairyRef
        .doc(dairyId)
        .get()
        .then((doc) => {
            let singleDairy = doc.data();
            console.log(doc.id, '=>', doc.data());
            res.send(singleDairy)
            })
            .catch(console.error);
});


const prodRef = db.collection("produce")

//First method to update

app.patch("/produce/:produceId", (req, res) => {
    const db = connectToFirestore();
    const { produceId } = req.params;
    prodRef

      .doc(produceId)
      .update(req.body)
      .then(() => res.send("Produce updated"))
      .catch(console.error);
  });

  //Second method to update
  async function updateType(type, inputDairy){
        const db = connectToFirestore()
    const dairyCollection = db.collection('dairy') //collection reference
    
    const snapshot = await dairyCollection.where('type', '==', inputDairy).get()

    snapshot.forEach(function(document){
      const documentRef = document.ref //this is the document found
      documentRef.update({'type': type}) //8. updates document
    })

   }
   updateType('blue cheese', 'gouda')
 
app.delete("/produce/:produceId", (req, res) => {
    const db = connectToFirestore();
    const { produceId } = req.params;
    prodRef

      .doc(produceId)
      .delete()
      .then(() => res.send("Produce deleted"))
      .catch(console.error);
  });


app.listen(3000,() => {console.log('listening on port 3000')})
