require("dotenv").config()
const sgMail = require("@sendgrid/mail")
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const nightmare = require("nightmare")()

const arguments = process.argv.slice(2)  //array that consists of args: node(0) parser.js(1) url(2) price(3)...start array from url
const url = arguments[0]
const minimumPrice = arguments[1]


async function checkPrice(){
    try{
        const priceString = await nightmare
                                        .goto(url)
                                        .wait("#priceblock_ourprice")
                                        .evaluate(() => document.getElementById("priceblock_ourprice").innerText)
                                        .end()
        const priceNumber = parseFloat(priceString.replace("CDN$", "")) //gives us only the number price to deal with
        if (priceNumber < minimumPrice){    
            // console.log("Price is low!")
            sendMail(   //sends email to designated user if price is lower than minPrice
                "Amazon Item price is low!",
                `Price for ${url} is now below ${minimumPrice} (the min. price threshold you previously entered)!`
            )
        }
        else{
            console.log("Price has not gone down")
        }
    } catch(e){
        sendMail("Price Checker Error", e.message)
        throw e
    }
}

function sendMail(subject, body){
    const email = {
        to: "clientexample@email.com",
        from: "serverexample@email.com",
        subject: subject,
        text: body,
        html: body
    }
    sgMail
    .send(email)
    .then(() => {}, error => {
        console.error(error);
     
        if (error.response) {
          console.error(error.response.body)
        }
      });
}

checkPrice()