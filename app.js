const Discord = require('discord.js');
require('dotenv').config();

//Creates new discord client
const client = new Discord.Client();

//Dependencies
const { Users, CurrencyShop } = require('./dbObjects');
const { Op } = require('sequelize');

const currency = new Discord.Collection();

//All user input must begin with ?
const PREFIX = '?';

Reflect.defineProperty(currency, 'add', {
	/* eslint-disable-next-line func-name-matching */
	value: async function add(id, amount) {
		const user = currency.get(id);
		if (user) {
			user.balance += Number(amount);
			return user.save();
		}
		const newUser = await Users.create({ user_id: id, balance: amount });
		currency.set(id, newUser);
		return newUser;
	},
});

Reflect.defineProperty(currency, 'getBalance', {
	/* eslint-disable-next-line func-name-matching */
	value: function getBalance(id) {
		const user = currency.get(id);
		return user ? user.balance : 0;
	},
});

//Client Log on
client.once('ready', async () => {

  	//Grab users
  	const storedBalances = await Users.findAll();
	storedBalances.forEach(b => currency.set(b.user_id, b));

  	//Console confirmation
	console.log(`Logged in as ${client.user.tag}!`);

});

//Main
client.on('message', async message => {

  	//TEMP Every message adds 1 gold
	if (message.author.bot) return;
	currency.add(message.author.id, 1);

  	//Check: Message starts with ?
	if (!message.content.startsWith(PREFIX)) return;

  	//Grabs message after ?
	const input = message.content.slice(PREFIX.length).trim();

  	//input => command
	if (!input.length) return;
	const [, command, commandArgs] = input.match(/(\w+)\s*([\s\S]*)/);

  	//Balance command
	if (command === 'bal') {

    		//Grabs user balance
		const target = message.mentions.users.first() || message.author;
		return message.channel.send(`${target.tag} has ${currency.getBalance(target.id)}💰`);

  }
  //Inventory command
  else if (command === 'inventory')
  {
    	//Grabs user
	const target = message.mentions.users.first() || message.author;
	const user = await Users.findOne({ where: { user_id: target.id } });

    	//Gets items
	const items = await user.getItems();

    	//User has 0 items
	if (!items.length) return message.channel.send(`${target.tag} has nothing!`);

    	//Displays user items
	return message.channel.send(`${target.tag} currently has ${items.map(t => `${t.amount} ${t.item.name}`).join(', ')}`);
  }
  //Transfer gold function
  else if (command === 'transfer')
  {
    	//Grabs user's current balance
	const currentAmount = currency.getBalance(message.author.id);


    	//Grabs INT of amount
	const transferAmount = commandArgs.split(/ +/).find(arg => !/<@!?\d+>/.test(arg));

    	//Grabs mentioned user
	const transferTarget = message.mentions.users.first();


    /*

    Conditions

    */

    	//Not INT
  if (!transferAmount || isNaN(transferAmount)) return message.channel.send(`Sorry ${message.author}, that's an invalid amount.`);

    	//Not enough
	if (transferAmount > currentAmount) return message.channel.send(`Sorry ${message.author} you don't have that much.`);

    	//Negative INT
	if (transferAmount <= 0) return message.channel.send(`Please enter an amount greater than zero, ${message.author}`);

      //Can't transfer to yourself


    	//Transfer action
	currency.add(message.author.id, -transferAmount);
	currency.add(transferTarget.id, transferAmount);

    	//Prompt complete
	return message.channel.send(`Successfully transferred ${transferAmount}💰 to ${transferTarget.tag}. Your current balance is ${currency.getBalance(message.author.id)}💰`);

  }
  //Buy function
  else if (command === 'buy')
  {
    	//Finds item
	const item = await CurrencyShop.findOne({ where: { name: { [Op.like]: commandArgs } } });

    	/*

    	Conditions

    	*/

    	//Invalid item name
	if (!item) return message.channel.send('That item doesn\'t exist.');

    	//Not enough
	if (item.cost > currency.getBalance(message.author.id)) {
			return message.channel.send(`You don't have enough currency, ${message.author}`);
	}

    	//Grabs item
	const user = await Users.findOne({ where: { user_id: message.author.id } });

    	//Takes money
	currency.add(message.author.id, -item.cost);

    	//Adds item
	await user.addItem(item);

    	//Prompt complete
	message.channel.send(`You've bought a ${item.name}`);


  }
  //Shop function
  else if (command === 'shop')
  {
    	//Grabs all item
	const items = await CurrencyShop.findAll();

    	//Presents items
	return message.channel.send(items.map(i => `${i.name}: ${i.cost}💰`).join('\n'), { code: true });

  }
  //Leaderboard function
  else if (command === 'leaderboard')
  {
     //Send message
     return message.channel.send(

     //SQL sorting query
	currency.sort((a, b) => b.balance - a.balance)
	.filter(user => client.users.cache.has(user.user_id))

    	//Grabs first 10 users
	.first(10)

    	//Presentation
	.map((user, position) => `(${position + 1}) ${(client.users.cache.get(user.user_id).tag)}: ${user.balance}💰`)
	.join('\n'),
	{ code: true },
);
  }
  //Dicing function
  else if (command === 'dice')
  {

      	//Grabs current balance
      	const currentAmount = currency.getBalance(message.author.id);

      	//User bet amount
      	const betAmount = commandArgs.split(/ +/).find(arg => !/<@!?\d+>/.test(arg));

      	/*
      	Conditions
      	*/

      	//Too much
  	if (betAmount > currentAmount) return message.channel.send(`Sorry ${message.author} you don't have that much.`);

      	//Negative INT
  	if (betAmount <= 0) return message.channel.send(`Please enter an amount greater than zero, ${message.author}`);

        //Not INT
    if (!betAmount || isNaN(betAmount)) return message.channel.send(`Sorry ${message.author}, that's an invalid amount.`);
      	//RNG
      	random = Math.floor(Math.random() * 101);

      	//Win
      	if(random >= 55) {

        //Adds bet
        currency.add(message.author.id, betAmount);

        //Prompt complete
        message.channel.send('You rolled a ' + random + ' and won ' + betAmount + '💰');

      }
      //Lose
      else if (random < 55)
      {

      	//Subtracts bet
        currency.add(message.author.id, -betAmount);

        //Prompt complete
        message.channel.send('You rolled a ' + random + ' and lost ' + betAmount + '💰');
      }
  }
  //Duel function

  else if (command === 'duel')
  {

    	//Current balance
    	const currentAmount = currency.getBalance(message.author.id);

    	//Amount dueled
    	const duelAmount = commandArgs.split(/ +/).find(arg => !/<@!?\d+>/.test(arg));

    	//Get mentioned user
    	const duelTarget = message.mentions.users.first();
      message.channel.send(duelTarget);

      //Get mentioned user Balance
      const targetCurr = currency.getBalance(duelTarget);
      message.channel.send(targetCurr);
    	/*
    	Conditions
    	*/

    	//No @Mention
    	//if(!(user instanceof User)) return message.channel.send('You did not mention a user to duel.');

    	//Can't duel yourself
    	//if (user.id === msg.author.id) return message.channel.send(`You cant duel yourself.`);

    	//Can't duel a bot
	    //if (user.bot) return message.channel.send(`You cant duel a bot.`);

      //Mentioned user too low balance
    	//if(duelAmount > targetCurr) return message.channel.send(duelTarget.Mention + " does not have enough gold");

      //Challenger has too low balance
      //if(duelAmount > currentAmount) return message.channel.send(message.author.id + " does not have enough gold");


    	//RNG
    	random = Math.floor(Math.random() * 101);
    	random2 = Math.floor(Math.random() * 101);

    	//Asks mentioned user
    	message.channel.send(duelTarget.Mention + 'press y to accept the duel').then(() => {

      	//Waiting
      	message.channel.awaitMessages(filter, {
        	max: 1,
        	time: 30000,
        	errors: ['time']
      	})
      	.then(message => {
        	message = message.first()

        //Checks if 'y' or 'Y'
        if (message.content.toUpperCase() == 'Y' || message.content.toUpperCase() == 'Y') {

          //User prompts
          message.channel.send('Duel accepted');
          message.channel.send('The duel begins...');
          message.channel.send('The fight is almost over...');

          //Challenger wins
          if(random >= random2) {

            //Challenger receives money
            currency.add(message.author.id, betAmount);

            //Accepting user loses money
            currency.add(duelTarget.id, -betAmount);
          }
          //Accepting user wins
          else if (random2 > random)
          {
            //Accepting user receives money
            currency.add(duelTarget.id, betAmount);

            //Challenger loses money
            currency.add(message.author.id, -betAmount);

          }
          else
          {
          //User did not accept duel
          message.channel.send('User did not accept in time');
          }
      }
    }
  )}
)}
});

//Starts client... place BOT_TOKEN in .env file
client.login(process.env.BOT_TOKEN)
