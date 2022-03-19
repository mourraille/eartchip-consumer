import Health from './models/Health.js'
import dotenv from 'dotenv'
import dclassify from 'dclassify';

// Utilities provided by dclassify
  var Classifier = dclassify.Classifier;
  var DataSet    = dclassify.DataSet;
  var Document   = dclassify.Document;
  var options = {
    applyInverse: true
};

// create a classifier
var classifier = new Classifier(options);

const classify = async function() {
    const array = await Health.find({});
    var data = new DataSet();
    array.forEach(element => {
        if(element.state == "Unhealthy") {
            data.add("Unhealthy",new Document  (element._id , [element.temp, element.soil]))
        } else if(element.state == "Healthy") {
            data.add("Healthy",new Document (element._id , [element.temp, element.soil]))
        } else if(element.state == "Regular") {
            data.add("Regular",new Document (element._id , [element.temp, element.soil]))
        }
    });

    
    // train the classifier
    classifier.train(data);
     console.log('Classifier trained.');
    // console.log(JSON.stringify(classifier.probabilities, null, 4));
    
    // // test the classifier on a new test item
    //  var testDoc = new Document('012512', ['perfect','underwatered']);    
    //  var result1 = classifier.classify( new Document('012512', ['perfect','underwatered']));
    //  console.log(result1);
}

const rate =  function(temp, soil) {
     var testDoc = new Document('012512', [temp,soil]);    
     var result1 = classifier.classify(testDoc);
     return result1.category
    }

export default {
 classify,
 rate
}

