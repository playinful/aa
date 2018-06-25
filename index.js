const Discord = require("discord.js");
const client = new Discord.Client();
const jsonfile = require('jsonfile');
const seedrandom = require('seedrandom');
const fs = require('fs')
  ,   gm = require('gm')
  ,   imageMagick = gm.subClass({imageMagick: true});
var mProfiles;
var mEvidence;
var savedCases;
var cases;
var suspects = new Map();
var evidence = new Map();
var menus = new Map();
var emojiMenus = new Map();
var idcounter;
var imgRefs;
var evidenceEdits = new Map();
var profileEdits = new Map();
var typeChannels = new Map();
var profileIndexes;
var examinations = new Map();
var votes = new Map();
var bubbles = new Map();
var yells = [
	["amaina","amaina"],
	["atencion","atencion"],
	["benvenuti","benvenuti"],
	["bienvenue","bienvenue"],
	["chotto","chotto"],
	["denegado","denegado"],
	["ecco","ecco"],
	["ecco\\W*qui","eccoqui"],
	["einspruch","einspruch"],
	["ertappt","ertappt"],
	["eureka","eureka"],
	["fermi\\W*tutti","fermitutti"],
	["gotcha","gotcha"],
	["got\\W*it","gotit"],
	["grazie\\W*mille","graziemille"],
	["hai","hai"],
	["hang\\W*on","hangon"],
	["have\\W*a\\W*look","havealook"],
	["hikae\\W*yo","hikaeyo"],
	["hirefuse","hirefuse"],
	["hold\\W*it","holdit"],
	["igiari","igiari"],
	["irasshaimase","irasshaimase"],
	["iuiisseum","iuiisseum"],
	["j\\W*te\\W*tiens","jtetiens"],
	["kokoda","kokoda"],
	["kore\\W*da","koreda"],
	["kurae","kurae"],
	["kyakka","kyakka"],
	["maidoari","maidoari"],
	["matta","matta"],
	["matte\\W*kure+","mattekureeee"],
	["mil\\W*gracias","milgracias"],
	["moment","moment"],
	["moment\\W*mal","momentmal"],
	["muy\\W*buenas","muybuenas"],
	["nimm\\W*das","nimmdas"],
	["not\\W*an\\W*rapido","notanrapido"],
	["not\\W*so\\W*fast","notsofast"],
	["obiezione","obiezione"],
	["objection","objection"],
	["over\\W*ruled","overruled"],
	["pas\\W*si\\W*vite","passivite"],
	["prends\\W*[çc]a","prendsca"],
	["protesto","protesto"],
	["satorh?a","satorha"],
	["schau","schau"],
	["sekunde","sekunde"],
	["shut\\W*up","shutup"],
	["silence","silence"],
	["sokoda","sokoda"],
	["such\\W*insolence","suchinsolence"],
	["take\\W*that","takethat"],
	["te\\W*tengo","tetengo"],
	["thanks\\W*a\\W*bunch","thanksabunch"],
	["that\\W*s\\W*enough","thatsenough"],
	["toma\\W*ya","tomaya"],
	["un\\W*attimo","unattimo"],
	["un\\W*instant","uninstant"],
	["un\\W*momento","unmomento"],
	["un\\W*segundo","unsegundo"],
	["welcome","welcome"],
	["welkom","welkom"],
	["willkommen","willkommen"]
]

const helpEmbed = new Discord.RichEmbed()
	.setTitle("Ace Attorney Bot Help")
	.setDescription("Below you will find a list of bot commands and their functions.")
	.addField("General Commands",
		"These are the general commands that can be used any time.\n\n"+
		"**aa.ping** - Send a generic message to check if the bot is alive.\n"+
		"**aa.help** - Send this help message.\n"+
		"**aa.jury** - Call upon the jury (server members) to make a verdict. *Mention a user with this command to have the jury declare a verdict on them.*\n"+
		"**aa.yell** - Yell a phrase.")
	.addBlankField()
	.addField("Court Record",
		"These are all the commands dealing with profiles and evidence.\n\n"+
		"**aa.viewprofile** - View the profile of a mentioned user.\n"+
		"**aa.setprofile** - Set the profile of a mentioned user.\n"+
		"**aa.evidence** - View the evidence in the Court Record.\n"+
		"**aa.add** - Add a new piece of evidence to the Court Record.\n"+
		"**aa.update** - Update a piece of evidence in the Court Record.\n"+
		"**aa.remove** - Remove a piece of evidence from the Court Record.\n"+
		"**aa.present** - Present a profile or a piece of evidence to the court. *This can be used to point out contradictions in a witness's testimony during a cross-examination.*")
	.addBlankField()
	.addField("Cross-Examinations",
		"All of these commands deal with cross-examinations.\n\n"+
		"**aa.crossexamine** - Begin a cross-examination.\n"+
		"**aa.append** - Append statements to a testimony.\n"+
		"**aa.redact** - Redact statements from a testimony.\n"+
		"**aa.press** - Press a statement in a witness's testimony.\n"+
		"**aa.repost** - Repost the testimony of a cross-examination.\n"+
		"**aa.stop** - Conclude a cross-examination.")
	.addBlankField()
	.addField("Judge (Admin) Controls",
		"These commands can only be used by the judges (Administrators).\n\n"+
		"**aa.attorney** - Set the **Attorney** role for the server. *Attorneys can perform cross-examinations, and use commands that other users cannot.*\n"+
		"**aa.penalize** - Penalize a user, lowering their health. *When an Attorney's health reaches 0, their Attorney privileges are revoked.*\n"+
		"**aa.heal** - Heal a user, restoring their health.\n"+
		"**aa.guilty** - Declare a guilty verdict. *Mention a user with this command to declare them guilty.*\n"+
		"**aa.notguilty** - Declare a not guilty verdict. *Mention a user with this command to declare them not guilty.*\n"+
		"**aa.clear** - Clear the Court Record of all profiles and evidence.");

// load data
jsonfile.readFile("data/profiles.json", function(err, obj) {
	mProfiles = new Map(obj);
	var profList = obj.map(item => {return item[1]}).reduce((total,item) => {
		if (!Array.isArray(total)) total = [total];
		if (Array.isArray(item)) return total.concat(item); else return total.concat([item]);
	});
	profList = profList.filter((item,index) => {
		return !profList.slice(0,index).includes(item);
	}).map((item,index) => {return [item,index]});
	profileIndexes = new Map(profList);
	console.log("Loaded profile search engine.");
});
jsonfile.readFile("data/evidence.json", function(err, obj) { mEvidence = obj;console.log("Loaded evidence search engine."); });
jsonfile.readFile("data/counter.json", function(err, obj) { idcounter = obj;console.log(`ID counter set to ${idcounter}.`); });
jsonfile.readFile("data/casefiles.json", function(err, obj) { savedCases = new Map(obj); });
jsonfile.readFile("data/imgmap.json", function(err, obj) { imgRefs = obj;console.log("Loaded image map."); });

// setup case files
function extrapolateCaseData() {
	cases = new Map(client.guilds.array().map(guild => {
		return [guild.id, new GuildCase(guild)];
	}));
	while (!savedCases) {}
	savedCases.forEach((val,key) => {
		if (cases.has(key)) {
			var reloadCase = cases.get(key);
			if (reloadCase.guild.roles.has(val.attorney)) {
				reloadCase.attorneyRoleId = val.attorney;
				reloadCase.attorneyRole = reloadCase.guild.roles.get(val.attorney);
			}
			new Map(val.suspects).forEach((sus,susId) => {
				if (reloadCase.suspects.has(susId)) {
					var suspect = reloadCase.suspects.get(susId);
					"name|description|alias|gender|image".split("|").forEach(prop => {
						suspect.profile[prop] = sus[prop];
					});
					suspect.age = typeof sus.age === "object" ? {toString:function(){return Math.floor((new Date().getTime() - 1516601064000) / 86400000) + " days"}} : sus.age;
					suspect.health = sus.health;
				}
			});
			reloadCase.evidence = new Map(val.evidence.map(item => {return [item[0], new Evidence(item[0],[item[1].name,item[1].description,item[1].file,item[1].image],reloadCase)]}));
		}
	});
	console.log("Cases prepared.");
	while (!imgRefs) {}
	imgRefs = new Map(imgRefs.map(item => {return [item[0],new ImgRef(item[1],item[0],true)]}));
	savedCases.forEach((val,key) => {
		if (cases.has(key)) {
			var reloadCase = cases.get(key);
			if (val.evidenceImgRef) reloadCase.evidenceImgRef = val.evidenceImgRef.map(item => {return imgRefs.get(item)});
		}
	});
	console.log("Images mapped.");
	updateAndSave();
}

// setup classes
function Command(cmd, exec, aliases, permissions) {
	this.cmd = cmd;
	this.aliases = aliases;
	this.permissions = commandPermissions(permissions);
	if (typeof exec === "function") {
		this.exec = exec;
	} else {
		this.exec = function(msg, args) {
			msg.channel.send(this.str);
		}
		this.str = exec;
	}
	this.execute = function(msg){
		if (!msg.author.bot) {
			if (this.aliases) var args = [this.cmd].concat(this.aliases).map(item => {return msg.content.replace(item, "").replace(/^\s*/, "")}).sort((a,b) => {return a.length - b.length})[0].split(/\s*/g); else var args = msg.content.replace(this.cmd, "").replace(/^\s*/, "").split(/\s*/g);
			if (this.permissions.includes("guild") && !"text|category".split("|").includes(msg.channel.type)) { msg.channel.send("This command is only accessible in a server channel. Sorry.");
			} else if (this.permissions.includes("admin") && msg.member && !msg.member.hasPermission("ADMINISTRATOR")) { msg.channel.send("This command can only be performed by an administrator. Sorry.");
			} else if (this.permissions.includes("attorney") && !suspects.get(msg.channel.guild.id+":"+msg.author.id).isAttorney()) { msg.channel.send(`This command can only be performed by Attorneys (**${cases.get(msg.channel.guild.id).attorneyRole.name}**). Sorry.`);
			} else if (this.permissions.includes("exam") && !examinations.has(msg.channel.id)) { msg.channel.send("There is no examination currently in progress in this channel.");
			} else this.exec(msg,args);
		}
	};
}
function commandPermissions(permissions) {
	if (permissions) {
		if (typeof permissions === "string") return [permissions]; else return permissions;
	} else return [];
}
function GuildCase(guild) {
	this.guild = guild;
	this.id = guild.id;
	this.suspects = new Map();
	guild.members.forEach(member => {new MemberSuspect(member,this)});
	this.evidence = new Map();
	this.examinations = new Map();
	this.attorneyRole = guild.roles.get(guild.id);
	this.attorneyRoleId = guild.id;
	this.evidenceImgRef = null;
	this.setImgRef = function(){ if (this.evidence.size>0) {
		if (!this.evidenceImgRef || this.evidenceImgRef.some(item => {return !item}) || this.evidenceImgRef.length<this.evidence.size/8) {
			this.evidenceImgRef = [];
			for (i=0;i<this.evidence.size/8;i++) {
				this.evidenceImgRef.push(new ImgRef(`images/generated/record/${this.id}-${i}.png`,"r:"+this.id+"-"+i.toString()));
				this.evidenceImgRef[i].gen(Array.from(this.evidence.values()).slice(i*8,(i+1)*8).map(item => {return item.image}), "images/other/court_record.png");
			}
		}
	} else this.evidenceImgRef = null};
	this.displayEvidence = function(msg){
		if (this.evidence.size>8) {
			this.evidenceImgRef[0].setReady(function(obj){
				var C = cases.get(obj.channel.guild.id);
				new HybridMenu(obj.channel,
					obj.channel.send(new Discord.RichEmbed()
						.setTitle(`Court Record(Page 1 of ${Math.floor(C.evidence.size/8)})`)
						.setDescription(`Type the index of the evidence you want to check (1-8, left-right, up-down) or **cancel**. Turn the page using the reactions below.`)
						.setImage(C.evidenceImgRef[0].url)),
					displayEvidence,
					courtRecordPage,
					["⬅","➡"],obj.author,0);
			},msg);
		} else {
			this.evidenceImgRef[0].setReady(function(obj){
				var C = cases.get(obj.channel.guild.id);
				new Menu(obj.channel,
					displayEvidence,
					obj.author,0);
				obj.channel.send(new Discord.RichEmbed()
					.setTitle(`Court Record`)
					.setDescription(`Type the index of the evidence you want to check (1-${C.evidence.size}, left-right, up-down) or **cancel**.`)
					.setImage(C.evidenceImgRef[0].url));
			},msg);
		}
	};
	this.editEvidence = function(msg){
		if (this.evidence.size>8) {
			this.evidenceImgRef[0].setReady(function(obj){
				var C = cases.get(obj.channel.guild.id);
				new HybridMenu(obj.channel,
					obj.channel.send(new Discord.RichEmbed()
						.setTitle(`Court Record(Page 1 of ${Math.floor(C.evidence.size/8)})`)
						.setDescription(`Type the index of the evidence you want to modify (1-8, left-right, up-down) or **cancel**. Turn the page using the reactions below.`)
						.setImage(C.evidenceImgRef[0].url)),
					editEvidence,
					courtRecordPage,
					["⬅","➡"],obj.author,0);
			},msg);
		} else {
			this.evidenceImgRef[0].setReady(function(obj){
				var C = cases.get(obj.channel.guild.id);
				new Menu(obj.channel,
					editEvidence,
					obj.author,0);
				obj.channel.send(new Discord.RichEmbed()
					.setTitle(`Court Record`)
					.setDescription(`Type the index of the evidence you want to modify (1-${C.evidence.size}, left-right, up-down) or **cancel**.`)
					.setImage(C.evidenceImgRef[0].url));
			},msg);
		}
	};
	this.removeEvidence = function(msg){
		if (this.evidence.size>8) {
			this.evidenceImgRef[0].setReady(function(obj){
				var C = cases.get(obj.channel.guild.id);
				new HybridMenu(obj.channel,
					obj.channel.send(new Discord.RichEmbed()
						.setTitle(`Court Record(Page 1 of ${Math.floor(C.evidence.size/8)})`)
						.setDescription(`Type the index of the evidence you want to destroy (1-8, left-right, up-down) or **cancel**. Turn the page using the reactions below.`)
						.setImage(C.evidenceImgRef[0].url)),
					removeEvidence,
					courtRecordPage,
					["⬅","➡"],obj.author,0);
			},msg);
		} else {
			this.evidenceImgRef[0].setReady(function(obj){
				var C = cases.get(obj.channel.guild.id);
				new Menu(obj.channel,
					removeEvidence,
					obj.author,0);
				obj.channel.send(new Discord.RichEmbed()
					.setTitle(`Court Record`)
					.setDescription(`Type the index of the evidence you want to destroy (1-${C.evidence.size}, left-right, up-down) or **cancel**.`)
					.setImage(C.evidenceImgRef[0].url));
			},msg);
		}
	};
	this.presentEvidence = function(msg){
		if (this.evidence.size>8) {
			this.evidenceImgRef[0].setReady(function(obj){
				var C = cases.get(obj.channel.guild.id);
				new HybridMenu(obj.channel,
					obj.channel.send(new Discord.RichEmbed()
						.setTitle(`Court Record(Page 1 of ${Math.floor(C.evidence.size/8)})`)
						.setDescription(`Type the index of the evidence you want to present (1-8, left-right, up-down), or present a user's profile by mentioning that user. Type \`cancel\` to cancel, or turn the page using the reactions below.`)
						.setImage(C.evidenceImgRef[0].url)),
					presentEvidence,
					courtRecordPage,
					["⬅","➡"],obj.author,0);
			},msg);
		} else if (this.evidence.size>0) {
			this.evidenceImgRef[0].setReady(function(obj){
				var C = cases.get(obj.channel.guild.id);
				new Menu(obj.channel,
					presentEvidence,
					obj.author,0);
				obj.channel.send(new Discord.RichEmbed()
					.setTitle(`Court Record`)
					.setDescription(`Type the index of the evidence you want to present (1-${C.evidence.size}, left-right, up-down), or present a user's profile by mentioning that user. Type \`cancel\` to cancel.`)
					.setImage(C.evidenceImgRef[0].url));
			},msg);
		} else {
			msg.channel.send(new Discord.RichEmbed()
				.setTitle("No evidence to present")
				.setDescription("There is no evidence to present. Present a user's profile by mentioning that user, or type `cancel` to cancel."));
			new Menu(msg.channel,presentEvidence,msg.author,0);
		}
	};
	this.resetImgRefs = function(){this.evidenceImgRef=null};
	this.clear = function(){
		this.evidence.forEach(item => {item.remove()});
		this.suspects = new Map();
		this.guild.members.forEach(member => {new MemberSuspect(member,this)});
		updateAndSave();
	};
	this.setAttorneyRole = function(role){
		this.attorneyRole = role;
		this.attorneyRoleId = role.id;
		updateAndSave();
	};
}
function MemberSuspect(member,Case) {
	this.member = member;
	this.user = member.user;
	this.id = member.id;
	this.guild = member.guild;
	this.Case = Case;
	this.guildId = member.guild.id;
	this.fullId = member.guild.id + ":" + member.id;
	this.profile = new SuspectProfile(this);
	this.isAttorney = function(){return (this.member && this.member.roles.has(this.Case.attorneyRoleId) && this.health > 0)};
	this.hasMenu = function(channel){return menus.has(channel.id+":"+this.id) || menus.has(channel.id+":e")};
	this.getMenu = function(channel){return menus.has(channel.id+":"+this.id) ? menus.get(channel.id+":"+this.id) : menus.get(channel.id+":e")};
	this.runMenu = function(msg){this.getMenu(msg.channel).callback(msg)};
	this.hasEmojiMenu = function(msg){if (emojiMenus.has(msg.id)) return (!emojiMenus.get(msg.id).user || emojiMenus.get(msg.id).userId === this.id)};
	this.getEmojiMenu = function(msg){if (this.hasEmojiMenu(msg)) return emojiMenus.get(msg.id)};
	this.runEmojiMenu = function(reac,user){this.getEmojiMenu(reac.message).callback(reac,user)};
	this.health = 100;
	this.penalize = function(amount){
		this.health -= amount;
		if (this.health < 0) this.health = 0;
		updateAndSave();
	};
	this.heal = function(amount){
		this.health += amount;
		if (this.health > 100) this.health = 100;
		updateAndSave();
	};
	suspects.delete(this.fullId);
	suspects.set(this.fullId,this);
	this.Case.suspects.delete(this.id);
	this.Case.suspects.set(this.id,this);
}
function SuspectProfile(suspect) {
	this.suspect = suspect;
	this.id = suspect.id;
	this.member = suspect.member;
	this.user = suspect.user;
	this.guild = suspect.guild;
	this.Case = suspect.Case;
	this.guildId = suspect.guild.id;
	this.fullId = suspect.fullId;
	this.username = function(){return this.suspect.user.username};
	this.nickname = function(){return this.suspect.member.nickname};
	this.name = null;
	this.description = this.id === client.user.id ? "The head judge who presides over all cases. Not to be crossed." : "Not much is known about this person.";
	this.gender = this.id === client.user.id ? "Agender" : "??";
	this.age = this.id === client.user.id ? {toString:function(){return Math.floor((new Date().getTime() - 1516601064000) / 86400000) + " days"}} : "??";
	this.alias = null;
	this.image = null;
	this.displayName = function(){return this.name ? this.name : this.user.username};
	this.displayAlias = function(){return this.alias ? (this.alias !== "none" ? this.alias : null) : this.member.nickname};
	this.displayImage = function(){return this.image ? this.image : this.user.displayAvatarURL};
	this.userDiscrim = function(){return this.user.username+"#"+this.user.discriminator};
	this.show = function(){
		var profEmbed = new Discord.RichEmbed()
			.setTitle(`${this.displayName()} (${this.userDiscrim()})`)
			.setDescription(this.description)
			.addField("Gender", this.gender, true)
			.addField("Age", this.age, true)
			.setThumbnail(this.displayImage());
		if (this.displayAlias()) profEmbed.addField("Alias", this.displayAlias(), true);
		if (this.suspect.health<100) profEmbed.addField("Health", `${this.suspect.health}/100`, true);
		return profEmbed;
	}
}
function Evidence(id,args,Case) {
	this.id = id.toString();
	this.Case = Case;
	this.guild = Case.guild;
	this.guildId = Case.guild.id;
	this.name = args[0];
	this.description = args[1];
	this.file = args[2];
	this.image = args[3];
	this.show = function(){
		var evEmbed = new Discord.RichEmbed()
			.setTitle(this.name)
			.setDescription(`${this.description}${this.file && !/png|jpe?g|gif$/i.test(this.file) ? "\n\n[Check...]("+this.file+")" : ""}`)
			.setThumbnail(this.image);
		if (this.file && /png|jpe?g|gif$/i.test(this.file)) evEmbed.setImage(this.file);
		return evEmbed;
	};
	this.remove = function(){
		this.Case.evidence.delete(this.id);
		evidence.delete(this.id);
		this.Case.resetImgRefs();
		updateAndSave();
	};
	this.Case.evidence.delete(this.id);
	this.Case.evidence.set(this.id,this);
	evidence.delete(this.id);
	evidence.set(this.id,this);
}
function Examination(msg) {
	this.origin = msg;
	this.str = msg.content;
	this.arr = getExamArr(this.str);
	this.channel = msg.channel;
	this.id = msg.channel.id;
	this.Case = cases.get(msg.channel.guild.id);
	this.witness = this.Case.suspects.get(msg.author.id);
	this.statement = 0;
	this.display = function(){
		this.channel.send(new Discord.RichEmbed()
			.setAuthor(`${this.witness.profile.displayName()}'s Testimony`,this.witness.profile.displayImage())
			.setTitle(`Statement ${this.statement+1} of ${this.arr.length}`)
			.setDescription(this.arr[this.statement])
			.setFooter(`Use \`aa.press\` or \`aa.present\` to interrogate the witness on this statement${this.arr.length>1 ? ", or browse other statements using the reactions below" : ""}.`))
		.then(msg => {
			this.msg = msg;
			this.msgId = msg.id;
			if (this.arr.length>1) {
				msg.react("⬅");
				msg.react("➡");
			}
		}).catch(err => {
			this.display();
		});
	};
	this.start = function(){
		typeChannels.set(this.channel.id,new Date().getTime());
		this.channel.send(new Discord.Attachment("images/splash/crossexamination.gif"))
			.then(msg => {this.display();typeChannels.delete(this.channel.id)})
			.catch(err => {this.display()});
	};
	this.terminate = function(){
		examinations.delete(this.id);
		this.Case.examinations.delete(this.id);
		this.msg = null;this.msgId = null;
		this.channel = null;this.id = null;
	};
	this.turnPage = function(emoji){
		if (this.arr.length>1) {
			switch (emoji) {
				case "⬅":
					this.statement--;
					if (this.statement<0) this.statement = this.arr.length-1;
					break;
				case "➡":
					this.statement++;
					if (this.statement>=this.arr.length) this.statement = 0;
					break;
			}
			this.msg.edit(new Discord.RichEmbed()
				.setAuthor(`${this.witness.profile.displayName()}'s Testimony`,this.witness.profile.displayImage())
				.setTitle(`Statement ${this.statement+1} of ${this.arr.length}`)
				.setDescription(this.arr[this.statement])
				.setFooter(`Use \`aa.press\` or \`aa.present\` to interrogate the witness on this statement, or browse other statements using the reactions below.`));
		}
	};
	this.pause = function(){
		this.msg = null;
		this.msgId = null;
	};
	examinations.delete(this.id);
	examinations.set(this.id,this);
	this.Case.examinations.delete(this.id);
	this.Case.examinations.set(this.id,this);
}
function Menu(channel,callback,user,extraData,hybrid) {
	this.channel = channel;
	this.channelId = channel.id;
	this.user = user;
	if (user) this.userId = user.id;
	this.id = channel.id+":"+(user ? user.id : "e");
	this.callback = callback;
	this.extraData = extraData;
	this.hybridMenu = hybrid;
	this.terminate = function(){menus.delete(this.id);this.terminated=true;if (this.hybridMenu && !this.hybridMenu.emojiMenu.terminated) this.hybridMenu.emojiMenu.terminate()};
	menus.delete(this.id);
	menus.set(this.id,this);
}
function EmojiMenu(message,callback,emojis,user,extraData,hybrid) {
	this.callback = callback;
	this.emojis = emojis;
	this.sentMessage = message;
	this.sentMessage.then(newMsg => {
		this.id = newMsg.id;
		this.message = newMsg;
		if (this.emojis) this.emojis.forEach(item => {newMsg.react(item)});
		emojiMenus.delete(this.id);
		if (!this.terminated) emojiMenus.set(this.id, this);
	});
	this.repost = function(msg){
		emojiMenus.delete(msg.id);
		var emb;
		var att;
		if (msg.attachments.size>0) {
			att = msg.attachments.first();
		}
		if (msg.embeds.length>0) {
			emb = new Discord.RichEmbed()
			var oldEmb = msg.embeds[0];
			if (oldEmb.author) emb.setAuthor(oldEmb.author.name,oldEmb.author.iconURL,oldEmb.author.url);
			if (oldEmb.color) emb.setColor(oldEmb.color);
			if (oldEmb.description) emb.setDescription(oldEmb.description);
			if (oldEmb.footer) emb.setFooter(oldEmb.footer.text,oldEmb.footer.iconURL);
			if (oldEmb.image) emb.setImage(oldEmb.image.url);
			if (oldEmb.thumbnail) emb.setThumbnail(oldEmb.thumbnail.url);
			if (oldEmb.timestamp) emb.setTimestamp(oldEmb.timestamp);
			if (oldEmb.title) emb.setTitle(oldEmb.title);
			if (oldEmb.url) emb.setURL(oldEmb.url);
			oldEmb.fields.forEach(field => {
				emb.addField(field.name,field.value,field.inline);
			});
		}
		if (att) typeChannels.set(msg.channel.id,new Date().getTime());
		msg.channel.send(msg.content,emb ? emb : (att ? att : null))
			.then(newMsg => {
				typeChannels.delete(msg.id);
				this.message = newMsg;
				this.id = newMsg.id;
				if (this.emojis) this.emojis.forEach(emoji => newMsg.react(emoji));
				if (!this.terminated) emojiMenus.set(this.id,this);
			})
			.catch(err => {this.repost(msg)});
	};
	this.user = user;
	if (user) this.userId = user.id;
	this.extraData = extraData;
	this.hybridMenu = hybrid;
	this.terminate = function(){emojiMenus.delete(this.id);this.terminated=true;if (this.hybridMenu && !this.hybridMenu.menu.terminated) this.hybridMenu.menu.terminate()};
}
function HybridMenu(channel,message,callback1,callback2,emojis,user,extraData) {
	this.menu = new Menu(channel,callback1,user,extraData,this);
	this.emojiMenu = new EmojiMenu(message,callback2,emojis,user,extraData,this);
	this.menu.emojiMenu = this.emojiMenu;
	this.emojiMenu.menu = this.menu;
	this.extraData = extraData;
}
function ImgRef(filename,id,load,onReady,metadata) {
	this.status = load ? 2 : 0;
	this.filename = filename;
	this.id = id;
	this.url = load ? filename : null;
	this.gen = function(imgs, bg){
		this.imgs = imgs; this.bg = bg;
		if ((typeof imgs === "string" || (Array.isArray(imgs) && imgs.length === 1)) && !bg) {
			this.url = Array.isArray(imgs) ? imgs[0] : imgs;
			if (this.url.substr(0,10) === "images/") this.url = "https://raw.githubusercontent.com/playinful/aa/master/" + this.url.substr(10);
			this.status = 2;
		} else {
			var img = imageMagick().command("montage");
			imgs.forEach(item => {img.in(item)});
			img.in("-background","none")
				.in("-tile","4x2")
				.in("-geometry",bg ? "40x40+4+4" : "70x70+0+0");
			console.log(img);
			img.write(this.filename, function(err){
				var exThis = getImgRefFromOutName(this.outname);
				if (!exThis.bg) {
					img = imageMagick().command("convert")
						.in(exThis.filename);
					if (exThis.imgs.length <= 4) img.in("-trim");
				} else if (exThis.bg) {
					img = imageMagick().command("composite")
						.in("-geometry","+32+60")
						.in(exThis.filename)
						.in(bg);
				}
				img.write(exThis.filename, function(err){
					var exThis = getImgRefFromOutName(this.outname);
					exThis.status++;
					exThis.upload();
				});
			});
		}
	};
	this.upload = function(){
		client.channels.get("411223626793091072").send("", new Discord.Attachment(this.filename)).then(msg => {
			this.url = msg.attachments.first().url;
			this.status++;
			saveCases();
			if (this.onReady) this.onReady(this.metadata);
		}).catch(this.upload);
	};
	this.setReady = function(cb,metadata){
		this.onReady = cb;
		this.metadata = metadata;
		if (this.status === 2) this.onReady(this.metadata);
	};
	if (!load) {
		imgRefs.delete(this.id);
		imgRefs.set(this.id, this);
	}
}
function Vote(msg) {
	if (msg.mentions.members.size===2) this.defendant = getSuspect(msg.mentions.members.first()).profile;
	this.channel = msg.channel;
	var time = Number(msg.content.replace(/<@!?[0-9]+>/g,"").replace(/\D/g,""));
	if (!isNaN(time)) this.time = Math.round(time)*1000; else this.time = 60000;
	this.send = function(){
		this.channel.send(`Everyone vote now! Is the defendant${this.defendant ? ", **"+this.defendant.displayName+"**," : ""} :regional_indicator_g: **guilty** or :ng: **not guilty**? ${Math.round(this.time/1000)} seconds remain!`)
			.then(newMsg => {
				newMsg.react("🇬");
				newMsg.react("🆖");
				this.msg = newMsg;
				this.id = newMsg.id;
				votes.delete(this.id);
				votes.set(this.id,this);
				if (this.timeout) client.clearTimeout(this.timeout);
				this.timeout = client.setTimeout(voteConclude,this.time,this);
			}).catch(err => {console.log(err);this.send()});
	};
	this.conclude = function(){
		var g = this.msg.reactions.has("🇬") ? this.msg.reactions.get("🇬").count-(this.msg.reactions.get("🇬").me ? 1 : 0) : 0;
		var ng = this.msg.reactions.has("🆖") ? this.msg.reactions.get("🆖").count-(this.msg.reactions.get("🆖").me ? 1 : 0) : 0;
		if (g > ng) {
			typeChannels.set(this.channel.id,new Date().getTime());
			this.channel.send(`Guilty: ${g}\nNot Guilty: ${ng}\n\nWe the jury, find the defendant${this.defendant ? ", **"+this.defendant.displayName+"**," : ""}...`,new Discord.Attachment("images/splash/notguilty.gif"))
				.then(newMsg => {typeChannels.delete(newMsg.channel.id)})
				.catch(err => {repostJuryGuilty(this.channel,g,ng,this.defendant)});
		} else if (g < ng) {
			typeChannels.set(this.channel.id,new Date().getTime());
			this.channel.send(`Guilty: ${g}\nNot Guilty: ${ng}\n\nWe the jury, find the defendant${this.defendant ? ", **"+this.defendant.displayName+"**," : ""}...`,new Discord.Attachment("images/splash/notguilty.gif"))
				.then(newMsg => {typeChannels.delete(newMsg.channel.id)})
				.catch(err => {repostJuryNotGuilty(this.channel,g,ng,this.defendant)});
		} else {
			this.channel.send(`Guilty: ${g}\nNot Guilty: ${ng}\n\nThe votes are tied-- it's a hung jury! The case is thrown out!`);
		}
		votes.delete(this.id);
	};
}
function Bubble(msg) {
	this.str = msg.content.replace(/^\W*aa\W*\w*\s*/ig,"").replace(/[^-a-zA-Z.,!? ]/ig,"");
	this.channel = msg.channel;
	this.id = msg.id;
	this.gen = function(){
		var shout = yells.find(item => {return new RegExp("^\\W*"+item[0]+"\\W*$","i").test(this.str)});
		if (this.str.length<=0) {
			yellRandom(this.channel);
		} else if (shout) {
			yell(shout[1],this.channel);
		} else {
			var img = imageMagick().command("convert")
				.in("images/other/bubble_empty.png")
				.in("-size","680x460!")
				.in("-background","none")
				.in("-font","Objection")
				.in("-stroke","black")
				.in("-strokewidth","5")
				.in("-kerning",`-${Math.round(25 - ((this.str.length / 4) - 1))}`)
				.in("-gravity","center")
				.in("-fill","#EC1C24FF")
				.in(`caption:${this.str}`)
				.in("-geometry","+10+10")
				.in("-composite");
			img.write(`images/generated/bubbles/${this.id}.png`, function(err){
				var exThis = getImgRefFromOutName(this.outname);
				exThis.channel.send("",new Discord.Attachment(this.outname)).then(newMsg => {typeChannels.delete(newMsg.channel.id)});
			});
		}
	}
	bubbles.delete(this.id);
	bubbles.set(this.id,this);
}
function Counter(msg) {
	this.user = msg.member ? getSuspect(msg.member).profile : msg.author;
	this.channel = msg.channel;
	this.id = msg.id;
	this.gen = function(){
		var img = imageMagick().command("convert")
			.in("images/other/counter_bg.png")
			.in(this.user.displayAvatarURL ? this.user.displayAvatarURL : this.user.displayImage())
			.in("images/other/counter_mask.png")
			.in("-geometry","372x372+588+172")
			.in("-composite");
		img.write(`images/generated/danganronpa/${this.id}.png`, function(err){
			var exThis = getImgRefFromOutName(this.outname);
			img = imageMagick().command("convert")
				.in(this.outname)
				.in("images/other/counter_fg.png")
				.in("-composite");
			img.write(this.outname, function(err){
				var exThis = getImgRefFromOutName(this.outname);
				exThis.channel.send("",new Discord.Attachment(this.outname))
					.then(newMsg => {typeChannels.delete(newMsg.channel.id)})
					.catch(err => {typeChannels.delete(exThis.channel.id)});
			});
		});
	};
	bubbles.delete(this.id);
	bubbles.set(this.id,this);
}
function Consent(msg) {
	this.user = msg.member ? getSuspect(msg.member).profile : msg.author;
	if (msg.mentions.members.size>0) {
		this.subject = getSuspect(msg.mentions.members.first()).profile;
	} else {
		var msgArr = msg.channel.messages.array().reverse();
		var subj = msgArr.find((item,index) => {if (index>0) return msgArr[index-1].author === msg.author && item.author !== msg.author; else return false});
		if (subj && subj.member) this.subject = getSuspect(subj.member).profile; else {
			if (msg.channel.guild) this.subject = suspects.get(msg.channel.guild.id + ":" + client.user.id).profile; else this.subject = client.user;
		}
	}
	this.channel = msg.channel;
	this.id = msg.id;
	this.gen = function(){
		var img = imageMagick().command("convert")
			.in("images/other/consent_bg.png")
			.in(this.user.displayAvatarURL ? this.user.displayAvatarURL : this.user.displayImage())
			.in("images/other/consent_mask.png")
			.in("-geometry","400x400+510+34")
			.in("-composite");
		img.write(`images/generated/danganronpa/${this.id}.png`, function(err){
			var exThis = getImgRefFromOutName(this.outname);
			img = imageMagick().command("convert")
				.in(this.outname)
				.in(exThis.subject.displayAvatarURL ? exThis.subject.displayAvatarURL : exThis.subject.displayImage())
				.in("images/other/consent_mask.png")
				.in("-geometry","400x400+50+34")
				.in("-composite");
			img.write(this.outname, function(err){
				var exThis = getImgRefFromOutName(this.outname);
				img = imageMagick().command("convert")
					.in(this.outname)
					.in("images/other/consent_fg.png")
					.in("-composite");
				img.write(this.outname, function(err){
					var exThis = getImgRefFromOutName(this.outname);
					exThis.channel.send("",new Discord.Attachment(this.outname))
						.then(newMsg => {typeChannels.delete(newMsg.channel.id)})
						.catch(err => {typeChannels.delete(exThis.channel.id)});
				});
			});
		});
	};
	bubbles.delete(this.id);
	bubbles.set(this.id,this);
}

// technical objects
function EvidenceEdit(evidence,menu) {
	this.evidence = evidence;
	this.menu = menu.id;
	this.id = evidence.id;
	this.name = evidence.name;
	this.description = evidence.description;
	this.file = evidence.file;
	this.image = evidence.image;
	this.show = function(){
		var emb = new Discord.RichEmbed()
			.setTitle("<Name> " + this.name)
			.setDescription("**<Description>**\n" + this.description)
			.addField("<File>", this.file ? this.file : "No file attached")
			.setThumbnail(this.image);
		if (/(png|jpe?g|gif)$/i.test(this.file)) emb.setImage(this.file);
		return emb;
	};
	this.commit = function(){
		var doReset = this.evidence.image !== this.image;
		this.evidence.name = this.name;
		this.evidence.description = this.description;
		this.evidence.file = this.file;
		this.evidence.image = this.image;
		if (doReset) this.evidence.Case.resetImgRefs();
		this.terminate();
		updateAndSave();
	};
	this.terminate = function(){
		evidenceEdits.delete(this.id);
	};
	this.override = function(){
		this.terminate();
		menus.get(this.menu).terminate();
	};
	evidenceEdits.delete(this.id);
	evidenceEdits.set(this.id,this);
}
function ProfileEdit(profile,menu) {
	this.profile = profile;
	this.menu = menu.id;
	this.id = profile.fullId;
	this.name = profile.name;
	this.description = profile.description;
	this.alias = profile.alias;
	this.gender = profile.gender;
	this.age = profile.age;
	this.image = profile.image;
	this.displayName = function(){return this.name ? this.name : this.profile.user.username};
	this.displayAlias = function(){return this.alias ? (this.alias !== "none" ? this.alias : "No known aliases") : (this.profile.member.nickname ? this.profile.member.nickname : "No known aliases")};
	this.displayImage = function(){return this.image ? this.image : this.profile.user.displayAvatarURL};
	this.show = function(){
		var emb = new Discord.RichEmbed()
			.setTitle(`<Name> ${this.displayName()} (${this.profile.userDiscrim()})`)
			.setDescription(`**<Description>**\n${this.description}`)
			.addField("<Gender>",this.gender,true)
			.addField("<Age>",this.age,true)
			.addField("<Alias>",this.displayAlias())
			.setThumbnail(this.displayImage());
		return emb;
	};
	this.commit = function(){
		this.profile.name = this.name;
		this.profile.description = this.description;
		this.profile.alias = this.alias;
		this.profile.image = this.image;
		this.profile.gender = this.gender;
		this.profile.age = this.age;
		this.terminate();
		updateAndSave();
	};
	this.terminate = function(){
		evidenceEdits.delete(this.id);
	};
	this.override = function(){
		this.terminate();
		menus.get(this.menu).terminate();
	};
	profileEdits.delete(this.id);
	profileEdits.set(this.id,this);
}

// savegame objects
function SavedCase(c) {
	this.suspects = Array.from(c.suspects.entries()).map(item => {return [item[0],new SavedSuspect(item[1])]});
	this.evidence = Array.from(c.evidence.entries()).map(item => {return [item[0],new SavedEvidence(item[1])]});
	this.attorney = c.attorneyRoleId;
	if (c.evidenceImgRef) this.evidenceImgRef = c.evidenceImgRef.map(ref => {return ref.id});
}
function SavedSuspect(s) {
	this.name = s.profile.name;
	this.description = s.profile.description;
	this.gender = s.profile.gender;
	this.age = s.profile.age;
	this.alias = s.profile.alias;
	this.image = s.profile.image;
	this.health = s.health;
}
function SavedEvidence(e) {
	this.name = e.name;
	this.description = e.description;
	this.file = e.file;
	this.image = e.image;
}
function SavedImgRef(r) {
	this.id = r.id;
	this.url = r.url;
}

// general functions
function getImgRefFromOutName(outname) {
	if (outname.substr(0,27) === "images/generated/record/") {
		return imgRefs.get("r:"+outname.slice(27,-4));
	} else if (outname.substr(0,29) === "images/generated/evidence/") {
		return imgRefs.get("e:"+outname.slice(29,-4));
	} else if (outname.substr(0,29) === "images/generated/profiles/") {
		return imgRefs.get("p:"+outname.slice(29,-4));
	} else if (outname.substr(0,28) === "images/generated/bubbles/") {
		return bubbles.get(outname.slice(28,-4));
	} else if (outname.substr(0,32) === "images/generated/danganronpa/") {
		return bubbles.get(outname.slice(32,-4));
	}
}
function updateAndSave() {
	updateImgRefs();
	saveCases();
}
function updateImgRefs() {
	cases.forEach(item => {
		item.setImgRef();
	});
}
function saveCases() {
	var save1 = Array.from(cases.entries()).map(item => {return [item[0],new SavedCase(item[1])]});
	var save2 = Array.from(imgRefs.entries()).map(item => {return [item[0],saveImgRef(item[1])]}).filter(item => {return item[1]});
	jsonfile.writeFile("data/casefiles.json", save1, {spaces: 2}, function(err) {
		//console.error(err)
	});
	jsonfile.writeFile("data/imgmap.json", save2, {spaces: 2}, function(err) {
		//console.error(err)
	});
	jsonfile.writeFile("data/counter.json", idcounter, {spaces: 2}, function(err) {
		//console.error(err)
	});
}
function saveImgRef(r) { if (r.status === 2) return r.url; }
function getSuspect(member) {return suspects.get(member.guild.id+":"+member.id)}
function getEvidenceMatches(keywords) {
	keywords = simplifyString(keywords).toLowerCase().split("_");
	return mEvidence.map((item,index) => {if (keywords.every(word => {return item.split(" ").includes(word)})) return index; else return null}).filter(item => {return item != null});
}
function getProfileMatches(keywords) {
	keywords = simplifyStringProfiles(keywords).toUpperCase().split("_");
	var profs = Array.from(mProfiles.entries()).filter(item => {return keywords.every(word => {return item[0].split("_").includes(word)})}).map(item => {return item[1]}).reduce((total,item) => {
		if (!Array.isArray(total)) total = [total];
		if (!Array.isArray(item)) return total.concat([item]); else return total.concat(item);
	});
	return Array.isArray(profs) ? profs.filter((item,index) => {return !profs.slice(0,index).includes(item)}) : (profs ? [profs] : []);
}
function simplifyStringProfiles(str) {
	return simplifyString(str.replace(/[- ☆]/ig,"_"));
}
function simplifyString(str) {
	var string = str.replace(/[-☆]/ig,"")
		.replace(/ /ig,"_")
		.replace(/[àȁáâāãäåăȃąǎȧḁạả]/ig, "a")
		.replace(/[çčĉćċȼ]/ig, "c")
		.replace(/[ďđɗɖ]/ig, "d")
		.replace(/[ēéěèȅêęëėẹẽĕȇȩęḙḛẻ]/ig, "e")
		.replace(/[īíǐĭìîįïĩỉị]/ig, "i")
		.replace(/[łƚ]/ig, "l")
		.replace(/[ñ]/ig, "n")
		.replace(/[ōóǒòôöõőøǫȯơọ]/ig, "o")
		.replace(/[ūúǔùŭûüůųũűȕṳṵṷủụư]/ig, "u")
		.replace(/[ỳýÿȳƴẏȳɏŷỷỹỵ]/ig, "y")
		.replace(/\W/ig, "")
		.toUpperCase();
	return string;
}
function getExamArr(str) {
	var arr = str.split(/\b/);
	var exArr = [""];
	arr.forEach((item,index) => {
		exArr[exArr.length-1] = exArr[exArr.length-1].concat(item);
		if (/[?!.…\n‼‽]/i.test(item)) exArr.push("");
	});
	exArr = exArr.map(item => {return item.replace(/(^\s*|\s*$)/g,"")});
	return exArr.filter(item => {return /\w/.test(item)});
}
function repostPress(msg) {
	msg.channel.send(`<@${examinations.get(msg.channel.id).witness.id}>, hold it!\n*${msg.member.displayName}, state your argument now. Type *\`aa.return\`* when you are ready to return to the testimony.*`)
		.then(newMsg => {typeChannels.delete(newMsg.channel.id)})
		.catch(err => {repostPress(msg)});
}
function repostPresent(channel, evidence, witness, member, examination) {
	channel.send(`${witness}, ${examination ? "objection" : "take that"}!\n*${member.displayName}, please state your argument now.${examination ? " Type *\`aa.return\`* when you are ready to return to the testimony." : ""}*`,
		evidence.show())
	.then(msg => {typeChannels.delete(msg.channel.id)})
	.catch(err => {repostPresent(channel,evidence,witness,member,examination)});
}
function repostGuilty(msg) {
	msg.channel.send(`I hereby declare the defendant${msg.mentions.users.size===1 ? ", **"+getSuspect(msg.mentions.members.first()).profile.displayName()+"**" : ""}...\n\n**G u i l t y !**`)
		.then(newMsg => {typeChannels.delete(msg.channel.id)})
		.catch(err => {repostGuilty(msg)});
}
function repostNotGuilty(msg) {
	msg.channel.send(`I hereby declare the defendant${msg.mentions.users.size===1 ? ", **"+getSuspect(msg.mentions.members.first()).profile.displayName()+"**" : ""}...\n\n**N o t   G u i l t y !**`)
		.then(newMsg => {typeChannels.delete(msg.channel.id)})
		.catch(err => {repostNotGuilty(msg)});
}
function voteConclude(vote) {
	vote.conclude();
}
function repostJuryGuilty(channel,g,ng,defendant) {
	channel.send(`Guilty: ${g}\nNot Guilty: ${ng}\n\nWe the jury, find the defendant${defendant ? ", **"+defendant.displayName+"**," : ""}...\n\n**G u i l t y !**`)
		.then(msg => {typeChannels.delete(msg.channel.id)})
		.catch(err => {repostJuryGuilty(channel,g,ng,defendant)});
}
function repostJuryNotGuilty(channel,g,ng,defendant) {
	channel.send(`Guilty: ${g}\nNot Guilty: ${ng}\n\nWe the jury, find the defendant${defendant ? ", **"+defendant.displayName+"**," : ""}...\n\n**N o t   G u i l t y !**`)
		.then(msg => {typeChannels.delete(msg.channel.id)})
		.catch(err => {repostJuryNotGuilty(channel,g,ng,defendant)});
}
function yellRandom(channel) {
	yell(yells[Math.floor(Math.random()*yells.length)][1],channel);
}
function yell(phrase,channel) {
	channel.send("",new Discord.Attachment("images/bubbles/"+phrase+".png"))
		.then(msg => {typeChannels.delete(msg.channel.id)})
		.catch(err => {typeChannels.delete(channel.id)});
}

// menus
function displayEvidence(msg) {
	if (/^cancel/i.test(msg.content)) {
		msg.channel.send("Never mind.");
		this.terminate();
	} else {
		var sel = Number(msg.content)-1;
		if (!isNaN(sel) && sel > -1 && sel < 8 && Number.isInteger(sel) && sel+(this.extraData*8) < cases.get(msg.channel.guild.id).evidence.size) {
			msg.channel.send(Array.from(cases.get(msg.channel.guild.id).evidence.values())[sel+(this.extraData*8)].show());
			this.terminate();
		} else msg.channel.send(`Please select a valid number between 1 and ${cases.get(msg.channel.guild.id).evidence.size>(this.extraData*8)+8 ? 8 : cases.get(msg.channel.guild.id).evidence.size-(this.extraData*8)}.`);
	}
}
function editEvidence(msg) {
	if (/^cancel/i.test(msg.content)) {
		msg.channel.send("Never mind.");
		this.terminate();
	} else {
		var sel = Number(msg.content)-1;
		if (!isNaN(sel) && sel > -1 && sel < 8 && Number.isInteger(sel) && sel+(this.extraData*8) < cases.get(msg.channel.guild.id).evidence.size) {
			var ev = Array.from(cases.get(msg.channel.guild.id).evidence.values())[sel+(this.extraData*8)];
			if (!evidenceEdits.has(ev.id)) {
				ev = new EvidenceEdit(ev,this);
				this.terminate();
				msg.channel.send("Which will you edit (**Name**, **Description**, **File**, **Icon**, or **cancel**)?",ev.show());
				new Menu(msg.channel,
					editEvidenceSel,
					msg.author,ev);
			} else {
				msg.channel.send(`That piece of evidence is already being edited. ${msg.member.hasPermission("ADMINISTRATOR") ? "Forcefully override the edit? (Y/N)" : "Please wait."}`);
				if (msg.member.hasPermission("ADMINISTRATOR")) {
					this.terminate();
					new Menu(msg.channel,editEvidenceOverride,msg.author,ev);
				}
			}
		} else msg.channel.send(`Please select a valid number between 1 and ${cases.get(msg.channel.guild.id).evidence.size>(this.extraData*8)+8 ? 8 : cases.get(msg.channel.guild.id).evidence.size-(this.extraData*8)}.`);
	}
}
function courtRecordPage(reac,user) {
	if (["⬅","➡"].includes(reac.emoji.name) && cases.get(reac.message.channel.guild.id).evidence.size>8) {
		switch (reac.emoji.name) {
			case "⬅":
				this.extraData--;
				if (this.extraData < 0) this.extraData = Math.floor((cases.get(reac.message.channel.guild.id).evidence.size-1)/8);
				break;
			case "➡":
				this.extraData++;
				if (this.extraData > Math.floor((cases.get(reac.message.channel.guild.id).evidence.size-1)/8)) this.extraData = 0;
				break;
		}
		this.hybridMenu.menu.extraData = this.extraData;
		if (!cases.get(reac.message.channel.guild.id).evidenceImgRef || !cases.get(reac.message.channel.guild.id).evidenceImgRef[this.extraData] || cases.get(reac.message.channel.guild.id).evidenceImgRef[this.extraData].status < 2 || cases.get(reac.message.channel.guild.id).evidenceImgRef.length<cases.get(reac.message.channel.guild.id).evidence.size/8) {typeChannels.delete(msg.channel.id);typeChannels.set(msg.channel.id,new Date().getTime())}
		while (!cases.get(reac.message.channel.guild.id).evidenceImgRef || !cases.get(reac.message.channel.guild.id).evidenceImgRef[this.extraData] || cases.get(reac.message.channel.guild.id).evidenceImgRef[this.extraData].status < 2 || cases.get(reac.message.channel.guild.id).evidenceImgRef.length<cases.get(reac.message.channel.guild.id).evidence.size/8) {}
		reac.message.edit(new Discord.RichEmbed()
			.setTitle(`Court Record${cases.get(reac.message.channel.guild.id).evidence.size>8 ? " (Page "+this.extraData+" of "+Math.floor(cases.get(reac.message.channel.guild.id).evidence.size/8)+")" : ""}`)
			.setDescription(`Type the index of the evidence you want to check (1-${cases.get(reac.message.channel.guild.id).evidence.size>(this.extraData*8)+8 ? 8 : cases.get(reac.message.channel.guild.id).evidence.size-(this.extraData*8)}, left-right, up-down) or **cancel**. Turn the page using the reactions below.`)
			.setImage(cases.get(reac.message.channel.guild.id).evidenceImgRef[this.extraData].url));
	}
}
function addEvidenceMenuName(msg) {
	if (/^cancel$/i.test(msg.content)) {
		msg.channel.send("Never mind.");
		this.terminate();
	} else if (msg.content.length<=32) {
		msg.channel.send(`__**${msg.content}**__\nNow please write a description for this piece of evidence. (Type \`cancel\` to cancel.)`);
		new Menu(msg.channel,addEvidenceMenuDescription,msg.author,msg.content);
	} else msg.channel.send("Evidence names should be no longer than 32 characters.");
}
function addEvidenceMenuDescription(msg) {
	if (/^cancel$/i.test(msg.content)) {
		msg.channel.send("Never mind.");
		this.terminate();
	} else {
		msg.channel.send(`__**${this.extraData}**__\n${msg.content.length>64 ? msg.content.substr(0,61)+"..." : msg.content}\n\nAdd a supplementary file to this evidence? Upload or link the file now. Type \`skip\` to skip, or \`cancel\` to cancel.`);
		new Menu(msg.channel,addEvidenceMenuFile,msg.author,[this.extraData].concat([msg.content]));
	}
}
function addEvidenceMenuFile(msg) {
	if (/^cancel$/i.test(msg.content)) {
		msg.channel.send("Never mind.");
		this.terminate();
	} else if (/^skip$/i.test(msg.content)) {
		this.extraData.push(null);
		msg.channel.send(`**__${this.extraData[0]}__**\n${this.extraData[1].length>64 ? this.extraData[1].substr(0,61)+"..." : this.extraData[1]}\n\nFinally, select an icon to represent this piece of evidence. Upload or link an image now, or type a set of keywords to search existing images. Type \`skip\` to skip, or \`cancel\` to cancel.`);
		new Menu(msg.channel,addEvidenceMenuIcon,msg.author,this.extraData);
	} else if (/https?:\/\//i.test(msg.content)) {
		this.extraData.push(/https?:\/\/\S*/i.exec(msg.content).toString());
		msg.channel.send(`**__${this.extraData[0]}__**\n${this.extraData[1].length>64 ? this.extraData[1].substr(0,61)+"..." : this.extraData[1]}\n\nFinally, select an icon to represent this piece of evidence. Upload or link an image now, or type a set of keywords to search existing images. Type \`skip\` to skip, or \`cancel\` to cancel.`);
		new Menu(msg.channel,addEvidenceMenuIcon,msg.author,this.extraData);
	} else if (msg.attachments.size>0) {
		this.extraData.push(msg.attachments.first().url);
		msg.channel.send(`**__${this.extraData[0]}__**\n${this.extraData[1].length>64 ? this.extraData[1].substr(0,61)+"..." : this.extraData[1]}\n\nFinally, select an icon to represent this piece of evidence. Upload or link an image now, or type a set of keywords to search existing images. Type \`skip\` to skip, or \`cancel\` to cancel.`);
		new Menu(msg.channel,addEvidenceMenuIcon,msg.author,this.extraData);
	} else msg.channel.send("Invalid file format. Please upload or link a file if you would like to add a supplementary file to this evidence. Type `skip` to skip, or `cancel` to cancel.");
}
function addEvidenceMenuIcon(msg) {
	if (/^cancel$/i.test(msg.content)) {
		msg.channel.send("Never mind.");
	} else if (/^skip$/i.test(msg.content)) {
		idcounter++;
		var ev = new Evidence(idcounter.toString(),this.extraData.concat(["https://raw.githubusercontent.com/playinful/aa/master/evidence/114.png"]),cases.get(msg.channel.guild.id));
		msg.channel.send(`**${this.extraData[0]}** added to the Court Record.`, ev.show());
		this.terminate();
		ev.Case.resetImgRefs();
		updateAndSave();
	} else if (msg.attachments.size>0 && /\.(png|jpe?g|gif)$/i.test(msg.attachments.first().url)) {
		idcounter++;
		var ev = new Evidence(idcounter.toString(),this.extraData.concat([msg.attachments.first().url]),cases.get(msg.channel.guild.id));
		msg.channel.send(`**${this.extraData[0]}** added to the Court Record.`, ev.show());
		this.terminate();
		ev.Case.resetImgRefs();
		updateAndSave();
	} else if (/https?:\/\/\S*\.(png|jpe?g|gif)/i.test(msg.content)) {
		idcounter++;
		var ev = new Evidence(idcounter.toString(),this.extraData.concat([/https?:\/\/\S*\.(png|jpe?g|gif)/i.exec(msg.content).toString()]),cases.get(msg.channel.guild.id));
		msg.channel.send(`**${this.extraData[0]}** added to the Court Record.`, ev.show());
		this.terminate();
		ev.Case.resetImgRefs();
		updateAndSave();
	} else if (msg.content.length>0) {
		var matches = getEvidenceMatches(msg.content);
		switch (matches.length) {
			case 0:
				msg.channel.send(`No results were found for "${msg.content.substr(0,1000)}". Search again using different keywords, upload or link an image, type \`skip\` to skip, or type \`cancel\` to cancel.`);
				break;
			case 1:
				msg.channel.send(new Discord.RichEmbed()
					.setTitle("Use this image? (Y/N)")
					.setImage("https://raw.githubusercontent.com/playinful/aa/master/evidence/"+matches[0]+".png"));
				new Menu(msg.channel,addEvidenceImageConfirm,msg.author,{options:this.extraData,sel:"https://raw.githubusercontent.com/playinful/aa/master/evidence/"+matches[0]+".png"});
				break;
			default:
				for (i=0;i<matches.length/8;i++) {
					if (!imgRefs.has("e:"+matches.slice(i*8,(i+1)*8).join(","))) {
						var p = new ImgRef("images/generated/evidence/"+matches.slice(i*8,(i+1)*8).join(",")+".png","e:"+matches.slice(i*8,(i+1)*8).join(","));
						p.gen(matches.slice(i*8,(i+1)*8).map(item => {return "images/evidence/"+item+".png"}));
					}
				}
				this.terminate();
				if (imgRefs.get("e:"+matches.slice(0,8).join(",")).status<2) typeChannels.set(msg.channel.id,new Date().getTime());
				imgRefs.get("e:"+matches.slice(0,8).join(",")).setReady(function(obj){
					if (obj.matches.length>8) {
						new HybridMenu(obj.msg.channel,obj.msg.channel.send(new Discord.RichEmbed()
							.setTitle("Multiple images found")
							.setDescription(`Several images were found matching '${obj.phrase}'. Type the index of the image you would like to use (1-8, left-right, up-down), or \`cancel\` to cancel. Turn the page using the reactions below.`)
							.setImage(this.url)),
						addEvidenceImageSelect,
						addEvidenceImagePage,
						["⬅","➡"],obj.msg.author,obj);
					} else {
						msg.channel.send(new Discord.RichEmbed()
							.setTitle("Multiple images found")
							.setDescription(`Several images were found matching '${obj.phrase}'. Type the index of the image you would like to use (1-${obj.matches.length}, left-right, up-down), or \`cancel\` to cancel.`)
							.setImage(this.url));
						new Menu(obj.msg.channel,addEvidenceImageSelect,obj.msg.author,obj);
					}
					typeChannels.delete(obj.msg.channel.id);
				},{msg:msg,matches:matches,phrase:msg.content.substr(0,1000),page:0,options:this.extraData});
				break;
		}
	} else msg.channel.send("Invalid image format. Please upload or link an image to represent this piece of evidence, or type a set of keywords to search for an existing image. Type `skip` to skip, or `cancel` to cancel.");
}
function addEvidenceImageSelect(msg) {
	var sel = Number(msg)-1;
	if (/^\W*cancel\W*$/i.test(msg.content)) {
		msg.channel.send(`**__${this.extraData.options[0]}__**\n${this.extraData.options[1].length>64 ? this.extraData.options[1].substr(0,61)+"..." : this.extraData.options[1]}\n\nFinally, select an icon to represent this piece of evidence. Upload or link an image now, or type a set of keywords to search existing images. Type \`skip\` to skip, or \`cancel\` to cancel.`);
		new Menu(msg.channel,addEvidenceMenuIcon,msg.author,this.extraData.options);
	} else if (!isNaN(sel) && Number.isInteger(sel) && sel >= 0 && sel < 8 && sel+(this.extraData.page*8) < this.extraData.matches.length) {
		this.extraData.sel = `https://raw.githubusercontent.com/playinful/aa/master/evidence/${this.extraData.matches[sel+(this.extraData.page*8)]}.png`;
		msg.channel.send(new Discord.RichEmbed()
			.setTitle("Use this image? (Y/N)")
			.setImage(this.extraData.sel));
		this.terminate();
		new Menu(msg.channel,addEvidenceImageConfirm,msg.author,this.extraData);
	} else msg.channel.send("Please select a valid number.");
};
function addEvidenceImagePage(reac,user) {
	if (["⬅","➡"].includes(reac.emoji.name)) {
		switch (reac.emoji.name) {
			case "⬅":
				this.extraData.page--;
				if (this.extraData.page<0) this.extraData.page = Math.ceil((this.extraData.matches.length/8)-1);
				break;
			case "➡":
				this.extraData.page++;
				if (this.extraData.page>=this.extraData.matches.length/8) this.extraData.page = 0;
				break;
		}
		this.extraData.msg = this.message;
		if (imgRefs.get("e:"+this.extraData.matches.slice(this.extraData.page*8,(this.extraData.page+1)*8).join(",")).status<2) typeChannels.set(reac.message.channel.id,new Date().getTime());
		imgRefs.get("e:"+this.extraData.matches.slice(this.extraData.page*8,(this.extraData.page+1)*8).join(",")).setReady(function(obj){
			obj.msg.edit(new Discord.RichEmbed()
				.setTitle("Multiple images found")
				.setDescription(`Several images were found matching '${obj.phrase}'. Type the index of the image you would like to use (1-${obj.matches.length-obj.page*8>8 ? 8 : obj.matches.length-obj.page*8}, left-right, up-down), or \`cancel\` to cancel. Turn the page using the reactions below.`)
				.setImage(this.url));
			typeChannels.delete(obj.msg.channel.id);
		},this.extraData);
	}
}
function addEvidenceImageConfirm(msg) {
	if (/^\W*y/i.test(msg.content)) {
		this.extraData.options.push(this.extraData.sel);
		idcounter++;
		var ev = new Evidence(idcounter,this.extraData.options,cases.get(msg.channel.guild.id));
		msg.channel.send(`**${this.extraData.options[0]}** added to the Court Record.`,ev.show());
		this.terminate();
		ev.Case.resetImgRefs();
		updateAndSave();
	} else if (/^\W*n/i.test(msg.content)) {
		if (!this.extraData.matches) {
			msg.channel.send(`**__${this.extraData.options[0]}__**\n${this.extraData.options[1].length>64 ? this.extraData.options[1].substr(0,61)+"..." : this.extraData.options[1]}\n\nFinally, select an icon to represent this piece of evidence. Upload or link an image now, or type a set of keywords to search existing images. Type \`skip\` to skip, or \`cancel\` to cancel.`);
			new Menu(msg.channel,addEvidenceMenuIcon,msg.author,this.extraData.options);
		} else if (this.extraData.matches.length>8) {
			this.extraData.page = 0;
			new HybridMenu(msg.channel,msg.channel.send(new Discord.RichEmbed()
				.setTitle("Multiple images found")
				.setDescription(`Several images were found matching '${this.extraData.phrase}'. Type the index of the image you would like to use (1-8, left-right, up-down), or \`cancel\` to cancel. Turn the page using the reactions below.`)
				.setImage(imgRefs.get("e:"+this.extraData.matches.slice(0,8).join(",")).url)),
			addEvidenceImageSelect,
			addEvidenceImagePage,
			["⬅","➡"],msg.author,this.extraData);
		} else {
			this.extraData.page = 0;
			msg.channel.send(new Discord.RichEmbed()
				.setTitle("Multiple images found")
				.setDescription(`Several images were found matching '${this.extraData.phrase}'. Type the index of the image you would like to use (1-${this.extraData.matches.length}, left-right, up-down), or \`cancel\` to cancel.`)
				.setImage(imgRefs.get("e:"+this.extraData.matches.slice(0,8).join(",")).url));
			new Menu(msg.channel,addEvidenceImageSelect,msg.author,this.extraData);
		}
	} else msg.channel.send("Please select Y or N.");
}
function editEvidenceSel(msg) {
	if (/^\W*c/i.test(msg.content)) {
		// cancel
		msg.channel.send("Never mind.");
		this.terminate();
		this.extraData.terminate();
	} else if (/^\W*[nt]/i.test(msg.content)) {
		// name
		msg.channel.send(new Discord.RichEmbed()
			.setTitle("Current name")
			.setDescription(this.extraData.name)
			.setFooter("Type a new name, or `cancel` to cancel."));
		new Menu(msg.channel,
			editEvidenceName,
			msg.author,this.extraData);
	} else if (/^\W*d/i.test(msg.content)) {
		// description
		msg.channel.send(new Discord.RichEmbed()
			.setTitle("Current description")
			.setDescription(this.extraData.description)
			.setFooter("Type a new description, or `cancel` to cancel."));
		new Menu(msg.channel,
			editEvidenceDescription,
			msg.author,this.extraData);
	} else if (/^\W*i/i.test(msg.content)) {
		// image
		msg.channel.send(new Discord.RichEmbed()
			.setTitle("Current image")
			.setImage(this.extraData.image)
			.setFooter("Upload or link a new image, search for an existing image by typing keywords, or type `cancel` to cancel."));
		new Menu(msg.channel,
			editEvidenceImage,
			msg.author,this.extraData);
	} else if (/^\W*f/i.test(msg.content)) {
		// file
		var emb = new Discord.RichEmbed()
			.setTitle("Current file")
			.setDescription(this.extraData.file ? this.extraData.file : "No file attached.")
			.setFooter(`Upload or link a new file, ${this.extraData.file ? "type \`none\` to remove the attached file, " : ""}or type \`cancel\` to cancel.`);
		if (/(png|jpe?g|gif)$/i.test(this.extraData.file)) emb.setImage(this.extraData.file);
		msg.channel.send(emb);
		new Menu(msg.channel,
			editEvidenceFile,
			msg.author,this.extraData);
	} else if (/^\W*s/i.test(msg.content)) {
		this.extraData.commit();
		msg.channel.send(`**${this.extraData.name}** has been updated.`,this.extraData.evidence.show());
		this.terminate();
	} else msg.channel.send("Which will you edit (**Name**, **Description**, **File**, **Icon**, or **cancel**)?");
}
function editEvidenceName(msg) {
	if (/^\W*cancel\W*$/i.test(msg.content)) {
		msg.channel.send("Which will you edit (**Name**, **Description**, **File**, or **Icon**; **cancel**, or **save**)?",this.extraData.show());
		new Menu(msg.channel,
			editEvidenceSel,
			msg.author,this.extraData);
	} else if (msg.content.length <= 32) {
		this.extraData.name = msg.content;
		msg.channel.send("Which will you edit (**Name**, **Description**, **File**, or **Icon**; **cancel**, or **save**)?",this.extraData.show());
		new Menu(msg.channel,
			editEvidenceSel,
			msg.author,this.extraData);
	} else msg.channel.send("Evidence names should be no longer than 32 characters.");
}
function editEvidenceDescription(msg) {
	if (/^\W*cancel\W*$/i.test(msg.content)) {
		msg.channel.send("Which will you edit (**Name**, **Description**, **File**, or **Icon**; **cancel**, or **save**)?",this.extraData.show());
		new Menu(msg.channel,
			editEvidenceSel,
			msg.author,this.extraData);
	} else {
		this.extraData.description = msg.content;
		msg.channel.send("Which will you edit (**Name**, **Description**, **File**, or **Icon**; **cancel**, or **save**)?",this.extraData.show());
		new Menu(msg.channel,
			editEvidenceSel,
			msg.author,this.extraData);
	}
}
function editEvidenceFile(msg) {
	if (/^\W*cancel\W*$/i.test(msg.content)) {
		msg.channel.send("Which will you edit (**Name**, **Description**, **File**, or **Icon**; **cancel**, or **save**)?",this.extraData.show());
		new Menu(msg.channel,
			editEvidenceSel,
			msg.author,this.extraData);
	} else if (msg.attachments.size>0) {
		this.extraData.file = msg.attachments.first().url;
		msg.channel.send("Which will you edit (**Name**, **Description**, **File**, or **Icon**; **cancel**, or **save**)?",this.extraData.show());
		new Menu(msg.channel,
			editEvidenceSel,
			msg.author,this.extraData);
	} else if (/^\W*none\W*$/i.test(msg.content)) {
		this.extraData.file = null;
		msg.channel.send("Which will you edit (**Name**, **Description**, **File**, or **Icon**; **cancel**, or **save**)?",this.extraData.show());
		new Menu(msg.channel,
			editEvidenceSel,
			msg.author,this.extraData);
	} else if (/\bhttps?:\/\/\S*/i.test(msg.content)) {
		this.extraData.file = /\bhttps?:\/\/\S*/i.exec(msg.content)[0].toString();
		msg.channel.send("Which will you edit (**Name**, **Description**, **File**, or **Icon**; **cancel**, or **save**)?",this.extraData.show());
		new Menu(msg.channel,
			editEvidenceSel,
			msg.author,this.extraData);
	} else msg.channel.send(`Invalid file format. Please upload or link a file if you would like to add a supplementary file to this evidence, ${this.extraData.file ? "type \`none\` to remove the attached file, " : ""}or type \`cancel\` to cancel.`);
}
function editEvidenceImage(msg) {
	if (/^\W*cancel\W*$/i.test(msg.content)) {
		msg.channel.send("Which will you edit (**Name**, **Description**, **File**, or **Icon**; **cancel**, or **save**)?",this.extraData.show());
		new Menu(msg.channel,
			editEvidenceSel,
			msg.author,this.extraData);
	} else if (msg.attachments.size>0 && /\.(png|jpe?g|gif)[^\s\w]*$/i.test(msg.attachments.first().url)) {
		this.extraData.image = msg.attachments.first().url;
		msg.channel.send("Which will you edit (**Name**, **Description**, **File**, or **Icon**; **cancel**, or **save**)?",this.extraData.show());
		new Menu(msg.channel,
			editEvidenceSel,
			msg.author,this.extraData);
	} else if (/\bhttps?:\/\/\S*\.(png|jpe?g|gif)[^\s\w]*\b/i.test(msg.content)) {
		this.extraData.image = /\bhttps?:\/\/\S*\.(png|jpe?g|gif)[^\s\w]*\b/i.exec(msg.content)[0].toString();
		msg.channel.send("Which will you edit (**Name**, **Description**, **File**, or **Icon**; **cancel**, or **save**)?",this.extraData.show());
		new Menu(msg.channel,
			editEvidenceSel,
			msg.author,this.extraData);
	} else if (msg.content.length>0) {
		var matches = getEvidenceMatches(msg.content);
		switch (matches.length) {
			case 0:
				msg.channel.send(`No results were found for "${msg.content.substr(0,1000)}". Search again using different keywords, upload or link an image, or type \`cancel\` to cancel.`);
				break;
			case 1:
				msg.channel.send(new Discord.RichEmbed()
					.setTitle("Use this image? (Y/N)")
					.setImage("https://raw.githubusercontent.com/playinful/aa/master/evidence/"+matches[0]+".png"));
				new Menu(msg.channel,
					editEvidenceImageConfirm,
					msg.author,{evidence:this.extraData,sel:"https://raw.githubusercontent.com/playinful/aa/master/evidence/"+matches[0]+".png"});
				break;
			default:
				for (i=0;i<matches.length/8;i++) {
					if (!imgRefs.has("e:"+matches.slice(i*8,(i+1)*8).join(","))) {
						var p = new ImgRef("images/generated/evidence/"+matches.slice(i*8,(i+1)*8).join(",")+".png","e:"+matches.slice(i*8,(i+1)*8).join(","));
						p.gen(matches.slice(i*8,(i+1)*8).map(item => {return "images/evidence/"+item+".png"}));
					}
				}
				this.terminate();
				if (imgRefs.get("e:"+matches.slice(0,8).join(",")).status<2) typeChannels.set(msg.channel.id,new Date().getTime());
				imgRefs.get("e:"+matches.slice(0,8).join(",")).setReady(function(obj){
					if (obj.matches.length>8) {
						new HybridMenu(obj.msg.channel,obj.msg.channel.send(new Discord.RichEmbed()
							.setTitle("Multiple images found")
							.setDescription(`Several images were found matching '${obj.phrase}'. Type the index of the image you would like to use (1-8, left-right, up-down), or \`cancel\` to cancel. Turn the page using the reactions below.`)
							.setImage(this.url)),
						editEvidenceImageSelect,
						addEvidenceImagePage,
						["⬅","➡"],obj.msg.author,obj);
					} else {
						msg.channel.send(new Discord.RichEmbed()
							.setTitle("Multiple images found")
							.setDescription(`Several images were found matching '${obj.phrase}'. Type the index of the image you would like to use (1-${obj.matches.length}, left-right, up-down), or \`cancel\` to cancel.`)
							.setImage(this.url));
						new Menu(obj.msg.channel,editEvidenceImageSelect,obj.msg.author,obj);
					}
					typeChannels.delete(obj.msg.channel.id);
				},{msg:msg,matches:matches,phrase:msg.content.substr(0,1000),page:0,evidence:this.extraData});
				break;
		}
	} else msg.channel.send("Invalid image format. Please upload or link an image to represent this piece of evidence, or type a set of keywords to search for an existing image. Type `skip` to skip, or `cancel` to cancel.");
}
function editEvidenceImageSelect(msg) {
	var sel = Number(msg)-1;
	if (/^\W*cancel\W*$/i.test(msg.content)) {
		msg.channel.send(new Discord.RichEmbed()
			.setTitle("Current image")
			.setImage(this.extraData.evidence.image)
			.setFooter("Upload or link a new image, search for an existing image by typing keywords, or type `cancel` to cancel."));
		new Menu(msg.channel,
			editEvidenceImage,
			msg.author,this.extraData.evidence);
	} else if (!isNaN(sel) && Number.isInteger(sel) && sel >= 0 && sel < 8 && sel+(this.extraData.page*8) < this.extraData.matches.length) {
		this.extraData.sel = `https://raw.githubusercontent.com/playinful/aa/master/evidence/${this.extraData.matches[sel+(this.extraData.page*8)]}.png`;
		msg.channel.send(new Discord.RichEmbed()
			.setTitle("Use this image? (Y/N)")
			.setImage(this.extraData.sel));
		this.terminate();
		new Menu(msg.channel,editEvidenceImageConfirm,msg.author,this.extraData);
	} else msg.channel.send("Please select a valid number.");
}
function editEvidenceImageConfirm(msg) {
	if (/^\W*y/i.test(msg.content)) {
		this.extraData.evidence.image = this.extraData.sel;
		msg.channel.send("Which will you edit (**Name**, **Description**, **File**, or **Icon**; **cancel**, or **save**)?",this.extraData.evidence.show());
		new Menu(msg.channel,
			editEvidenceSel,
			msg.author,this.extraData.evidence);
	} else if (/^\W*n/i.test(msg.content)) {
		if (!this.extraData.matches) {
			msg.channel.send(new Discord.RichEmbed()
				.setTitle("Current image")
				.setImage(this.extraData.evidence.image)
				.setFooter("Upload or link a new image, search for an existing image by typing keywords, or type `cancel` to cancel."));
			new Menu(msg.channel,
				editEvidenceImage,
				msg.author,this.extraData.evidence);
		} else if (this.extraData.matches.length>8) {
			this.extraData.page = 0;
			new HybridMenu(msg.channel,msg.channel.send(new Discord.RichEmbed()
				.setTitle("Multiple images found")
				.setDescription(`Several images were found matching '${this.extraData.phrase}'. Type the index of the image you would like to use (1-8, left-right, up-down), or \`cancel\` to cancel. Turn the page using the reactions below.`)
				.setImage(imgRefs.get("e:"+this.extraData.matches.slice(0,8).join(",")).url)),
			editEvidenceImageSelect,
			addEvidenceImagePage,
			["⬅","➡"],msg.author,this.extraData);
		} else {
			this.extraData.page = 0;
			msg.channel.send(new Discord.RichEmbed()
				.setTitle("Multiple images found")
				.setDescription(`Several images were found matching '${this.extraData.phrase}'. Type the index of the image you would like to use (1-${this.extraData.matches.length}, left-right, up-down), or \`cancel\` to cancel.`)
				.setImage(imgRefs.get("e:"+this.extraData.matches.slice(0,8).join(",")).url));
			new Menu(msg.channel,editEvidenceImageSelect,msg.author,this.extraData);
		}
	} else msg.channel.send("Please select Y or N.");
}
function removeEvidence(msg) {
	if (/^cancel/i.test(msg.content)) {
		msg.channel.send("Never mind.");
		this.terminate();
	} else {
		var sel = Number(msg.content)-1;
		if (!isNaN(sel) && sel > -1 && sel < 8 && Number.isInteger(sel) && sel+(this.extraData*8) < cases.get(msg.channel.guild.id).evidence.size) {
			var ev = Array.from(cases.get(msg.channel.guild.id).evidence.values())[sel+(this.extraData*8)];
			if (!evidenceEdits.has(ev.id)) {
				this.terminate();
				msg.channel.send("Are you sure you want to destroy this piece of evidence? **This action cannot be undone!** (Y/N)",ev.show());
				new Menu(msg.channel,
					removeEvidenceConfirm,
					msg.author,ev);
			} else {
				msg.channel.send(`That piece of evidence is currently being edited. ${msg.member.hasPermission("ADMINISTRATOR") ? "Forcefully override the edit? (Y/N)" : "Please wait."}`);
				if (msg.member.hasPermission("ADMINISTRATOR")) {
					this.terminate;
					new Menu(msg.channel,removeEvidenceOverride,msg.author,ev);
				}
			}
		} else msg.channel.send(`Please select a valid number between 1 and ${cases.get(msg.channel.guild.id).evidence.size>(this.extraData*8)+8 ? 8 : cases.get(msg.channel.guild.id).evidence.size-(this.extraData*8)}.`);
	}
}
function removeEvidenceConfirm(msg) {
	if (/^\W*y/i.test(msg.content)) {
		if (!evidenceEdits.has(this.extraData.id)) {
			this.extraData.remove();
			this.terminate();
			msg.channel.send(`**${this.extraData.name}** removed from the Court Record.`,this.extraData.show());
		} else {
			msg.channel.send(`That piece of evidence is currently being edited. ${msg.member.hasPermission("ADMINISTRATOR") ? "Forcefully override the edit? (Y/N)" : "Please wait."}`);
			if (msg.member.hasPermission("ADMINISTRATOR")) {
				this.terminate();
				new Menu(msg.channel,removeEvidenceConfirmOverride,msg.author,this.extraData);
			}
		}
	} else if (/^\W*n/i.test(msg.content)) {
		msg.channel.send("Never mind.");
		this.terminate();
	} else msg.channel.send("Are you sure you would like to destroy this piece of evidence? Please select Y or N.",this.extraData.show());
}
function viewProfileMention(msg) {
	if (/^\s*aa\W*/i.test(msg.content)) {
		this.terminate();
	} else if (msg.mentions.members.size > 0) {
		if (msg.mentions.members.size < 2) {
			msg.channel.send(suspects.get(msg.channel.guild.id + ":" + msg.mentions.members.first().id).profile.show());
			this.terminate();
		} else msg.channel.send("Please mention only one user.");
	} else this.terminate();
}
function setProfileMention(msg) {
	if (/^\s*aa\W*/i.test(msg.content)) {
		this.terminate();
	} else if (msg.mentions.members.size > 0) {
		if (msg.mentions.members.size < 2) {
			var prof = suspects.get(msg.channel.guild.id + ":" + msg.mentions.members.first().id).profile;
			if (!profileEdits.has(prof.fullId)) {
				prof = new ProfileEdit(prof,this);
				msg.channel.send("Which will you edit (**Name**, **Description**, **Gender**, **Age**, **Alias**, **Image**, or **cancel**)?",prof.show());
				new Menu(msg.channel,setProfileSel,msg.author,prof);
			} else {
				msg.channel.send(`That person's profile is already being edited. ${msg.member.hasPermission("ADMINISTRATOR") ? "Forcefully override the edit? (Y/N)" : "Please wait."}`);
				if (msg.member.hasPermission("ADMINISTRATOR")) new Menu(msg.channel,setProfileOverride,msg.author,prof);
			}
		} else msg.channel.send("Please mention only one user.");
	} else this.terminate();
}
function setProfileSel(msg) {
	if (/^\W*c/i.test(msg.content)) {
		// cancel
		msg.channel.send("Never mind.");
		this.terminate();
		this.extraData.terminate();
	} else if (/^\W*s/i.test(msg.content)) {
		// save
		this.extraData.commit();
		this.terminate();
		msg.channel.send(`**${this.extraData.profile.displayName()}** (${this.extraData.profile.userDiscrim()})'s profile has been updated.`);
	} else if (/^\W*[nt]/i.test(msg.content)) {
		// name
		msg.channel.send(new Discord.RichEmbed()
			.setTitle("Current name")
			.setDescription(this.extraData.displayName())
			.setFooter(`Type a new name, or type \`cancel\` to cancel.${this.extraData.name ? " Type \`reset\` to reset this suspect's name to their username." : ""}`));
		new Menu(msg.channel,setProfileName,msg.author,this.extraData);
	} else if (/^\W*d/i.test(msg.content)) {
		// description
		msg.channel.send(new Discord.RichEmbed()
			.setTitle("Current description")
			.setDescription(this.extraData.description)
			.setFooter("Type a new description, or type `cancel` to cancel."));
		new Menu(msg.channel,setProfileDescription,msg.author,this.extraData);
	} else if (/^\W*g/i.test(msg.content)) {
		// gender
		msg.channel.send(new Discord.RichEmbed()
			.setTitle("Current gender")
			.setDescription(this.extraData.gender)
			.setFooter("Type a new value, or type `cancel` to cancel."));
		new Menu(msg.channel,setProfileGender,msg.author,this.extraData);
	} else if (/^\W*ag/i.test(msg.content)) {
		// age
		msg.channel.send(new Discord.RichEmbed()
			.setTitle("Current age")
			.setDescription(this.extraData.age)
			.setFooter("Type a new value, or type `cancel` to cancel."));
		new Menu(msg.channel,setProfileAge,msg.author,this.extraData);
	} else if (/^\W*al/i.test(msg.content)) {
		// alias
		msg.channel.send(new Discord.RichEmbed()
			.setTitle("Current alias")
			.setDescription(this.extraData.displayAlias())
			.setFooter(`Type a new alias, or type \`cancel\` to cancel.${this.extraData.displayAlias() !== "No known aliases" ? " Type \`none\` to remove the current alias." : ""}${this.extraData.alias ? " Type \`reset\` to reset this suspect's alias to their nickname, if any." : ""}`));
		new Menu(msg.channel,setProfileAlias,msg.author,this.extraData);
	} else if (/^\W*i/i.test(msg.content)) {
		// image
		msg.channel.send(new Discord.RichEmbed()
			.setTitle("Current name")
			.setImage(this.extraData.displayImage())
			.setFooter(`Upload or link a new image, select an existing image from a set of keywords, or type \`cancel\` to cancel.${this.extraData.image ? " Type \`reset\` to restore the suspect's original profile image." : ""}`));
		new Menu(msg.channel,setProfileImage,msg.author,this.extraData);
	} else msg.channel.send("Which will you edit (**Name**, **Description**, **Gender**, **Age**, **Alias**, **Image**; **cancel**, or **save**)?",this.extraData.show());
}
function setProfileName(msg) {
	if (/^\W*cancel\W*$/i.test(msg.content)) {
		msg.channel.send("Which will you edit (**Name**, **Description**, **Gender**, **Age**, **Alias**, **Image**; **cancel**, or **save**)?",this.extraData.show());
		new Menu(msg.channel,setProfileSel,msg.author,this.extraData);
	} else if (/^\W*reset\W*$/i.test(msg.content)) {
		this.extraData.name = null;
		msg.channel.send("Which will you edit (**Name**, **Description**, **Gender**, **Age**, **Alias**, **Image**; **cancel**, or **save**)?",this.extraData.show());
		new Menu(msg.channel,setProfileSel,msg.author,this.extraData);
	} else if (msg.content.length <= 32) {
		this.extraData.name = msg.content;
		msg.channel.send("Which will you edit (**Name**, **Description**, **Gender**, **Age**, **Alias**, **Image**; **cancel**, or **save**)?",this.extraData.show());
		new Menu(msg.channel,setProfileSel,msg.author,this.extraData);
	} else msg.channel.send("Profile names should be no longer than 32 characters.");
}
function setProfileDescription(msg) {
	if (/^\W*cancel\W*$/i.test(msg.content)) {
		msg.channel.send("Which will you edit (**Name**, **Description**, **Gender**, **Age**, **Alias**, **Image**; **cancel**, or **save**)?",this.extraData.show());
		new Menu(msg.channel,setProfileSel,msg.author,this.extraData);
	} else {
		this.extraData.description = msg.content;
		msg.channel.send("Which will you edit (**Name**, **Description**, **Gender**, **Age**, **Alias**, **Image**; **cancel**, or **save**)?",this.extraData.show());
		new Menu(msg.channel,setProfileSel,msg.author,this.extraData);
	}
}
function setProfileGender(msg) {
	if (/^\W*cancel\W*$/i.test(msg.content)) {
		msg.channel.send("Which will you edit (**Name**, **Description**, **Gender**, **Age**, **Alias**, **Image**; **cancel**, or **save**)?",this.extraData.show());
		new Menu(msg.channel,setProfileSel,msg.author,this.extraData);
	} else if (msg.content.length <= 32) {
		this.extraData.gender = msg.content;
		msg.channel.send("Which will you edit (**Name**, **Description**, **Gender**, **Age**, **Alias**, **Image**; **cancel**, or **save**)?",this.extraData.show());
		new Menu(msg.channel,setProfileSel,msg.author,this.extraData);
	} else msg.channel.send("Gender values should be no longer than 32 characters.");
}
function setProfileAge(msg) {
	if (/^\W*cancel\W*$/i.test(msg.content)) {
		msg.channel.send("Which will you edit (**Name**, **Description**, **Gender**, **Age**, **Alias**, **Image**; **cancel**, or **save**)?",this.extraData.show());
		new Menu(msg.channel,setProfileSel,msg.author,this.extraData);
	} else if (msg.content.length <= 32) {
		this.extraData.age = msg.content;
		msg.channel.send("Which will you edit (**Name**, **Description**, **Gender**, **Age**, **Alias**, **Image**; **cancel**, or **save**)?",this.extraData.show());
		new Menu(msg.channel,setProfileSel,msg.author,this.extraData);
	} else msg.channel.send("Age values should be no longer than 32 characters.");
}
function setProfileAlias(msg) {
	if (/^\W*cancel\W*$/i.test(msg.content)) {
		msg.channel.send("Which will you edit (**Name**, **Description**, **Gender**, **Age**, **Alias**, **Image**; **cancel**, or **save**)?",this.extraData.show());
		new Menu(msg.channel,setProfileSel,msg.author,this.extraData);
	} else if (/^\W*reset\W*$/i.test(msg.content)) {
		this.extraData.alias = null;
		msg.channel.send("Which will you edit (**Name**, **Description**, **Gender**, **Age**, **Alias**, **Image**; **cancel**, or **save**)?",this.extraData.show());
		new Menu(msg.channel,setProfileSel,msg.author,this.extraData);
	} else if (/^\W*none\W*$/i.test(msg.content)) {
		this.extraData.alias = "none";
		msg.channel.send("Which will you edit (**Name**, **Description**, **Gender**, **Age**, **Alias**, **Image**; **cancel**, or **save**)?",this.extraData.show());
		new Menu(msg.channel,setProfileSel,msg.author,this.extraData);
	} else {
		this.extraData.alias = msg.content;
		msg.channel.send("Which will you edit (**Name**, **Description**, **Gender**, **Age**, **Alias**, **Image**; **cancel**, or **save**)?",this.extraData.show());
		new Menu(msg.channel,setProfileSel,msg.author,this.extraData);
	}
}
function setProfileImage(msg) {
	if (/^\W*cancel\W*$/i.test(msg.content)) {
		msg.channel.send("Which will you edit (**Name**, **Description**, **Gender**, **Age**, **Alias**, **Image**; **cancel**, or **save**)?",this.extraData.show());
		new Menu(msg.channel,setProfileSel,msg.author,this.extraData);
	} else if (/^\W*reset\W*$/i.test(msg.content)) {
		this.extraData.image = null;
		msg.channel.send("Which will you edit (**Name**, **Description**, **Gender**, **Age**, **Alias**, **Image**; **cancel**, or **save**)?",this.extraData.show());
		new Menu(msg.channel,setProfileSel,msg.author,this.extraData);
	} else if (msg.attachments.size>0 && /\.(png|jpe?g|gif)[^\s\w]*$/i.test(msg.attachments.first().url)) {
		this.extraData.image = msg.attachments.first().url;
		msg.channel.send("Which will you edit (**Name**, **Description**, **Gender**, **Age**, **Alias**, **Image**; **cancel**, or **save**)?",this.extraData.show());
		new Menu(msg.channel,setProfileSel,msg.author,this.extraData);
	} else if (/\bhttps?:\/\/\S*\.(png|jpe?g|gif)[^\s\w]*\b/i.test(msg.content)) {
		this.extraData.image = /\bhttps?:\/\/\S*\.(png|jpe?g|gif)[^\s\w]*\b/i.exec(msg.content)[0].toString();
		msg.channel.send("Which will you edit (**Name**, **Description**, **Gender**, **Age**, **Alias**, **Image**; **cancel**, or **save**)?",this.extraData.show());
		new Menu(msg.channel,setProfileSel,msg.author,this.extraData);
	} else if (msg.content.length>0) {
		var matches = getProfileMatches(msg.content);
		switch (matches.length) {
			case 0:
				msg.channel.send(`No results were found for "${msg.content.substr(0,1000)}". Search again using different keywords, upload or link an image, ${this.extraData.image ? "type \`reset\` to restore the suspect's original profile image, " : ""}or type \`cancel\` to cancel.`);
				break;
			case 1:
				msg.channel.send(new Discord.RichEmbed()
					.setTitle("Use this image? (Y/N)")
					.setImage("https://raw.githubusercontent.com/playinful/aa/master/profiles/"+matches[0]+".png"));
				new Menu(msg.channel,
					setProfileImageConfirm,
					msg.author,{profile:this.extraData,sel:"https://raw.githubusercontent.com/playinful/aa/master/profiles/"+matches[0]+".png"});
				break;
			default:
				for (i=0;i<matches.length/8;i++) {
					if (!imgRefs.has("p:"+matches.slice(i*8,(i+1)*8).map(item => {return profileIndexes.get(item)}).join(","))) {
						var p = new ImgRef("images/generated/profiles/"+matches.slice(i*8,(i+1)*8).map(item => {return profileIndexes.get(item)}).join(",")+".png","p:"+matches.slice(i*8,(i+1)*8).map(item => {return profileIndexes.get(item)}).join(","));
						p.gen(matches.slice(i*8,(i+1)*8).map(item => {return "images/profiles/"+item+".png"}));
					}
				}
				this.terminate();
				if (imgRefs.get("p:"+matches.slice(0,8).map(item => {return profileIndexes.get(item)}).join(",")).status<2) typeChannels.set(msg.channel.id,new Date().getTime());
				imgRefs.get("p:"+matches.slice(0,8).map(item => {return profileIndexes.get(item)}).join(",")).setReady(function(obj){
					if (obj.matches.length>8) {
						new HybridMenu(obj.msg.channel,obj.msg.channel.send(new Discord.RichEmbed()
							.setTitle("Multiple images found")
							.setDescription(`Several images were found matching '${obj.phrase}'. Type the index of the image you would like to use (1-8, left-right, up-down), or \`cancel\` to cancel. Turn the page using the reactions below.`)
							.setImage(this.url)),
						setProfileImageSelect,
						setProfileImagePage,
						["⬅","➡"],obj.msg.author,obj);
					} else {
						msg.channel.send(new Discord.RichEmbed()
							.setTitle("Multiple images found")
							.setDescription(`Several images were found matching '${obj.phrase}'. Type the index of the image you would like to use (1-${obj.matches.length}, left-right, up-down), or \`cancel\` to cancel.`)
							.setImage(this.url));
						new Menu(obj.msg.channel,setProfileImageSelect,obj.msg.author,obj);
					}
					typeChannels.delete(obj.msg.channel.id);
				},{msg:msg,matches:matches,phrase:msg.content.substr(0,1000),page:0,profile:this.extraData});
				break;
		}
	} else msg.channel.send("Invalid image format. Please upload or link an image to represent this profile, or type a set of keywords to search for an existing image. Type `cancel` to cancel.");
}
function setProfileImageSelect(msg) {
	var sel = Number(msg)-1;
	if (/^\W*cancel\W*$/i.test(msg.content)) {
		msg.channel.send(new Discord.RichEmbed()
			.setTitle("Current image")
			.setImage(this.extraData.profile.displayImage())
			.setFooter(`Upload or link a new image, search for an existing image by typing keywords, or type \`cancel\` to cancel.${this.extraData.profile.image ? " Type \`reset\` to restore the suspect's original profile image." : ""}`));
		new Menu(msg.channel,
			setProfileImage,
			msg.author,this.extraData.profile);
	} else if (!isNaN(sel) && Number.isInteger(sel) && sel >= 0 && sel < 8 && sel+(this.extraData.page*8) < this.extraData.matches.length) {
		this.extraData.sel = `https://raw.githubusercontent.com/playinful/aa/master/profiles/${this.extraData.matches[sel+(this.extraData.page*8)]}.png`;
		msg.channel.send(new Discord.RichEmbed()
			.setTitle("Use this image? (Y/N)")
			.setImage(this.extraData.sel));
		this.terminate();
		new Menu(msg.channel,setProfileImageConfirm,msg.author,this.extraData);
	} else msg.channel.send("Please select a valid number.");
}
function setProfileImagePage(reac,user) {
	if (["⬅","➡"].includes(reac.emoji.name)) {
		switch (reac.emoji.name) {
			case "⬅":
				this.extraData.page--;
				if (this.extraData.page<0) this.extraData.page = Math.ceil((this.extraData.matches.length/8)-1);
				break;
			case "➡":
				this.extraData.page++;
				if (this.extraData.page>=this.extraData.matches.length/8) this.extraData.page = 0;
				break;
		}
		this.extraData.msg = this.message;
		if (imgRefs.get("p:"+this.extraData.matches.slice(this.extraData.page*8,(this.extraData.page+1)*8).map(item => {return profileIndexes.get(item)}).join(",")).status<2) typeChannels.set(reac.message.channel.id,new Date().getTime());
		imgRefs.get("p:"+this.extraData.matches.slice(this.extraData.page*8,(this.extraData.page+1)*8).map(item => {return profileIndexes.get(item)}).join(",")).setReady(function(obj){
			obj.msg.edit(new Discord.RichEmbed()
				.setTitle("Multiple images found")
				.setDescription(`Several images were found matching '${obj.phrase}'. Type the index of the image you would like to use (1-${obj.matches.length-obj.page*8>8 ? 8 : obj.matches.length-obj.page*8}, left-right, up-down), or \`cancel\` to cancel. Turn the page using the reactions below.`)
				.setImage(this.url));
			typeChannels.delete(obj.msg.channel.id);
		},this.extraData);
	}
}
function setProfileImageConfirm(msg) {
	if (/^\W*y/i.test(msg.content)) {
		this.extraData.profile.image = this.extraData.sel;
		msg.channel.send("Which will you edit (**Name**, **Description**, **Gender**, **Age**, **Alias**, **Image**; **cancel**, or **save**)?",this.extraData.profile.show());
		new Menu(msg.channel,setProfileSel,msg.author,this.extraData.profile);
	} else if (/^\W*n/i.test(msg.content)) {
		if (!this.extraData.matches) {
			msg.channel.send(new Discord.RichEmbed()
				.setTitle("Current image")
				.setImage(this.extraData.profile.displayImage())
				.setFooter(`Upload or link a new image, search for an existing image by typing keywords, or type \`cancel\` to cancel.${this.extraData.profile.image ? " Type \`reset\` to restore the suspect's original profile image." : ""}`));
			new Menu(msg.channel,setProfileImage,msg.author,this.extraData.profile);
		} else if (this.extraData.matches.length>8) {
			this.extraData.page = 0;
			new HybridMenu(msg.channel,msg.channel.send(new Discord.RichEmbed()
				.setTitle("Multiple images found")
				.setDescription(`Several images were found matching '${this.extraData.phrase}'. Type the index of the image you would like to use (1-8, left-right, up-down), or \`cancel\` to cancel. Turn the page using the reactions below.`)
				.setImage(imgRefs.get("p:"+this.extraData.matches.slice(0,8).map(item => {return profileIndexes.get(item)}).join(",")).url)),
			setProfileImageSelect,
			setProfileImagePage,
			["⬅","➡"],msg.author,this.extraData);
		} else {
			this.extraData.page = 0;
			msg.channel.send(new Discord.RichEmbed()
				.setTitle("Multiple images found")
				.setDescription(`Several images were found matching '${this.extraData.phrase}'. Type the index of the image you would like to use (1-${this.extraData.matches.length}, left-right, up-down), or \`cancel\` to cancel.`)
				.setImage(imgRefs.get("p:"+this.extraData.matches.slice(0,8).map(item => {return profileIndexes.get(item)}).join(",")).url));
			new Menu(msg.channel,setProfileImageSelect,msg.author,this.extraData);
		}
	} else msg.channel.send("Please select Y or N.");
}
function editEvidenceOverride(msg) {
	if (/^\W*y/i.test(msg.content)) {
		evidenceEdits.get(this.extraData.id).override();
		msg.channel.send("Done.");
		ev = new EvidenceEdit(this.extraData,this);
		msg.channel.send("Which will you edit (**Name**, **Description**, **File**, **Icon**, or **cancel**)?",ev.show());
		new Menu(msg.channel,editEvidenceSel,msg.author,ev);
	} else if (/^\W*n/i.test(msg.content)) {
		msg.channel.send("OK.");
		this.terminate();
	} else this.terminate();
}
function removeEvidenceOverride(msg) {
	if (/^\W*y/i.test(msg.content)) {
		evidenceEdits.get(this.extraData.id).override();
		msg.channel.send("Done.");
		msg.channel.send("Are you sure you want to destroy this piece of evidence? **This action cannot be undone!** (Y/N)",this.extraData.show());
		new Menu(msg.channel,removeEvidenceConfirm,msg.author,this.extraData);
	} else if (/^\W*n/i.test(msg.content)) {
		msg.channel.send("OK.");
		this.terminate();
	} else this.terminate();
}
function removeEvidenceConfirmOverride(msg) {
	if (/^\W*y/i.test(msg.content)) {
		evidenceEdits.get(this.extraData.id).override();
		msg.channel.send("Done.");
		this.extraData.remove();
		this.terminate();
		msg.channel.send(`**${this.extraData.name}** removed from the Court Record.`,this.extraData.show());
	} else if (/^\W*n/i.test(msg.content)) {
		msg.channel.send("OK.");
		this.terminate();
	} else this.terminate();
}
function setProfileOverride(msg) {
	if (/^\W*y/i.test(msg.content)) {
		profileEdits.get(this.extraData.fullId).override();
		msg.channel.send("Done.");
		prof = new ProfileEdit(this.extraData,this);
		msg.channel.send("Which will you edit (**Name**, **Description**, **Gender**, **Age**, **Alias**, **Image**, or **cancel**)?",prof.show());
		new Menu(msg.channel,setProfileSel,msg.author,prof);
	} else if (/^\W*n/i.test(msg.content)) {
		msg.channel.send("OK.");
		this.terminate();
	} else this.terminate();
}
function crossExamineStart(msg) {
	if (!examinations.has(msg.channel.id)) {
		if (/^\W*cancel\W*$/i.test(msg.content)) {
			msg.channel.send("Never mind.");
			this.terminate();
		} else if (msg.type === "PINS_ADD") {
			typeChannels.set(msg.channel.id,new Date().getTime());
			this.terminate();
			msg.channel.fetchPinnedMessages()
				.then(pins => {
					if (pins.first().content.length>0) {
						new Examination(pins.first()).start();
					} else {
						msg.channel.send("That message can't be cross-examined. Sorry.");
						new Menu(msg.channel,crossExamineStart,msg.author);
					}
					typeChannels.delete(msg.channel.id);
				});
		} else if (/^\W*\d+\W*$/i.test(msg.content)) {
			typeChannels.set(msg.channel.id,new Date().getTime());
			this.terminate();
			msg.channel.fetchMessages({limit:1,around:/\b\d+\b/i.exec(msg.content)[0].toString()})
				.then(exMsg => {
					exMsg = exMsg.first();
					typeChannels.delete(msg.channel.id);
					if (exMsg.content.length>0) {
						new Examination(exMsg).start();
					} else {
						msg.channel.send("That message can't be cross-examined. Sorry.");
						new Menu(msg.channel,crossExamineStart,msg.author);
					}
				}).catch(err => {
					console.error(err);
					msg.channel.send("The message with that ID could not be found in this channel. Please pin or post the ID of the message you would like to cross-examine, or type `cancel` to cancel.");
					typeChannels.delete(msg.channel.id);
					new Menu(msg.channel,crossExamineStart,msg.author);
				});
		} else msg.channel.send("Please pin or post the ID of the message you would like to cross-examine, or type `cancel` to cancel.");
	} else {
		msg.channel.send("A cross-examination is already in progress in this channel. End it with `aa.stop`, or repost the testimony with `aa.repost`.");
		this.terminate();
	}
}
function examQuitConfirm(msg) {
	if (/^\W*y/i.test(msg.content)) {
		var exam = examinations.get(msg.channel.id);
		this.terminate();
		if (exam) {
			msg.channel.send(`The cross-examination of **${exam.witness.profile.displayName()}** has concluded.`);
			exam.terminate();
		} else msg.channel.send("The examination has already concluded.");
	} else if (/^\W*n/i.test(msg.content)) {
		msg.channel.send("Never mind.");
		this.terminate();
	} else msg.channel.send("Really end this cross-examination? (Y/N)");
}
function appendMenu(msg) {
	if (/^\W*cancel\W*$/i.test(msg.content)) {
		msg.channel.send("Never mind.");
		this.terminate();
	} else if (msg.content.length>0) {
		var exam = examinations.get(msg.channel.id);
		exam.arr = exam.arr.slice(0,exam.statement+1).concat(getExamArr(msg.content)).concat(exam.arr.slice(exam.statement+1));
		exam.statement++;
		exam.display();
		this.terminate();
	} else msg.channel.send("Please provide the statement or statements you wish to append to this testimony. Type `cancel` to cancel.");
}
function redactConfirm(msg) {
	if (/^\W*y/i.test(msg.content)) {
		var exam = examinations.get(msg.channel.id);
		exam.arr.splice(exam.statement,1);
		if (exam.statement>=exam.arr.length) exam.statement = 0;
		exam.display();
		this.terminate();
	} else if (/^\W*n/i.test(msg.content)) {
		msg.channel.send("Never mind.");
		this.terminate();
	} else msg.channel.send(new Discord.RichEmbed().setTitle("Redact this statement? Please select Y or N.").setDescription(examinations.get(msg.channel.id).arr[examinations.get(msg.channel.id).statement]));
}
function presentEvidence(msg) {
	if (/^\W*cancel\W*$/i.test(msg.content)) {
		var exam = examinations.get(msg.channel.id);
		if (exam) exam.display(); else msg.channel.send("Never mind.");
		this.terminate();
	} else if (msg.mentions.members.size>0) {
		if (msg.mentions.members.size<2) {
			var prof = getSuspect(msg.mentions.members.first()).profile;
			if (examinations.has(msg.channel.id)) {
				msg.channel.send("Present this profile? (Y/N)",prof.show());
				new Menu(msg.channel,presentEvidenceConfirm,msg.author,prof);
			} else {
				msg.channel.send("Please mention the user(s) or role(s) to whom you would like to present this profile. Type `cancel` to cancel.",prof.show());
				new Menu(msg.channel,presentEvidenceMention,msg.author,prof);
			}
		} else msg.channel.send("Please mention only one user.");
	} else {
		var sel = Number(msg.content)-1;
		if (!isNaN(sel) && Number.isInteger(sel) && sel >= 0 && sel < 8 && sel+(this.extraData*8) < cases.get(msg.channel.guild.id).evidence.size) {
			var ev = Array.from(cases.get(msg.channel.guild.id).evidence.values())[sel+(this.extraData*8)];
			if (examinations.has(msg.channel.id)) {
				msg.channel.send("Present this evidence? (Y/N)",ev.show());
				new Menu(msg.channel,presentEvidenceConfirm,msg.author,ev);
			} else {
				msg.channel.send("Please mention the user(s) or role(s) to whom you would like to present this evidence. Type `cancel` to cancel.",ev.show());
				new Menu(msg.channel,presentEvidenceMention,msg.author,ev);
			}
		} else if (cases.get(msg.channel.guild.id).evidence.size > 0) {
			msg.channel.send("Please select a valid number, or mention a user to present their profile. Type `cancel` to cancel.");
		} else msg.channel.send("Please mention a user to present their profile, or type `cancel` to cancel.");
	}
}
function presentEvidenceConfirm(msg) {
	if (/^\W*n/i.test(msg.content)) {
		cases.get(msg.channel.guild.id).presentEvidence(msg);
	} else if (/^\W*y/i.test(msg.content)) {
		if (examinations.has(msg.channel.id)) {
			typeChannels.set(msg.channel.id,new Date().getTime());
			msg.channel.send(`<@${examinations.get(msg.channel.id).witness.id}>, objection!\n*${msg.member.displayName}, please state your argument now. Type *\`aa.return\`* when you are ready to return to the testimony.*`,
				new Discord.Attachment("images/bubbles/objection.png"),
				this.extraData.show())
			.then(newMsg => {typeChannels.delete(newMsg.channel.id)})
			.catch(err => {repostPresent(msg.channel,this.extraData,`<@${examinations.get(msg.channel.id).witness.id}>`,msg.member,true)});
			this.terminate();
		} else {
			msg.channel.send("Please mention the user(s) or role(s) to whom you would like to present this evidence. Type `cancel` to cancel.",this.extraData.show());
			new Menu(msg.channel,presentEvidenceMention,msg.author,this.extraData);
		}
	} else msg.channel.send("Present this evidence? Please select Y or N.",this.extraData.show());
}
function presentEvidenceMention(msg) {
	if (/^\W*cancel\W*$/i.test(msg.content)) {
		msg.channel.send("Never mind.");
		this.terminate();
	} else if (msg.mentions.everyone) {
		msg.channel.send(`@everyone, take that!\n*${msg.member.displayName}, please state your argument now.*`,
			new Discord.Attachment("images/bubbles/takethat.png"),
			this.extraData.show())
		.then(newMsg => {typeChannels.delete(newMsg.channel.id)})
		.catch(err => {repostPresent(msg.channel,this.extraData,"@everyone",msg.member)});
		this.terminate();
	} else if (msg.mentions.users.size>0 || msg.mentions.roles.size>0) {
		msg.channel.send(`${/^.*\>/.exec(Array.from(msg.mentions.roles.values()).concat(Array.from(msg.mentions.users.values())).map(item => {return item.toString()}).join(", ").substr(0,1750))[0]}, take that!\n*${msg.member.displayName}, please state your argument now.*`,
			new Discord.Attachment("images/bubbles/takethat.png"),
			this.extraData.show())
		.then(newMsg => {typeChannels.delete(newMsg.channel.id)})
		.catch(err => {repostPresent(msg.channel,this.extraData,/^.*\>/.exec(Array.from(msg.mentions.roles.values()).concat(Array.from(msg.mentions.users.values())).map(item => {return item.toString()}).join(", ").substr(0,1750))[0],msg.member)});
		this.terminate();
	} else msg.channel.send("Please mention the user(s) or role(s) to whom you would like to present this evidence to.",this.extraData.show());
}
function penalizeUser(msg) {
	if (/^\W*cancel\W*$/i.test(msg.content)) {
		msg.channel.send("Never mind.");
		this.terminate();
	} else if (msg.mentions.users.size>0 || msg.mentions.roles.size>0 || msg.mentions.everyone) {
		var mentions = msg.channel.guild.members.array().filter(member => {return msg.isMentioned(member.id)}).map(member => {return getSuspect(member)});
		if (mentions.length<=25) {
			var emb = new Discord.RichEmbed().setTitle("Penalize users");
			mentions.forEach(member => {emb.addField(member.profile.displayName(),`HP: ${member.health}/100`,true)});
			msg.channel.send("Penalize users by how much? (Type `cancel` to cancel.)",emb);
			new Menu(msg.channel,penalizeAmount,msg.author,mentions);
		} else {
			msg.channel.send("Only 25 users may be penalized at a time. Please mention 25 or fewer users to penalize, or type `cancel` to cancel.");
		}
	}
}
function penalizeAmount(msg) {
	if (/^\W*cancel\W*$/i.test(msg.content)) {
		msg.channel.send("Never mind.");
		this.terminate();
	} else {
		var sel = Number(msg.content);
		if (!isNaN(sel) && Number.isInteger(sel) && sel > 0) {
			var str = "";
			this.extraData.forEach((item,index) => {
				item.penalize(sel);
				str = str.concat(`${index>0 ? "\n" : ""}<@${item.id}>'s HP falls to ${item.health}${item.health>0 ? "." : "! Their lawyering days are over!"}`);
			});
			msg.channel.send(str.substr(0,2000));
			this.terminate();
		} else msg.channel.send("Invalid amount. Please specify the amount by which you would like to penalize the mentioned users, or type `cancel` to cancel.");
	}
}
function healUser(msg) {
	if (/^\W*cancel\W*$/i.test(msg.content)) {
		msg.channel.send("Never mind.");
		this.terminate();
	} else if (msg.mentions.users.size>0 || msg.mentions.roles.size>0 || msg.mentions.everyone) {
		var mentions = msg.channel.guild.members.array().filter(member => {return msg.isMentioned(member.id)}).map(member => {return getSuspect(member)});
		if (mentions.length<=25) {
			var emb = new Discord.RichEmbed().setTitle("Heal users");
			mentions.forEach(member => {emb.addField(member.profile.displayName(),`HP: ${member.health}/100`,true)});
			msg.channel.send("Heal users by how much? (Type `cancel` to cancel.)",emb);
			new Menu(msg.channel,healAmount,msg.author,mentions);
		} else {
			msg.channel.send("Only 25 users may be healed at a time. Please mention 25 or fewer users to heal, or type `cancel` to cancel.");
		}
	}
}
function healAmount(msg) {
	if (/^\W*cancel\W*$/i.test(msg.content)) {
		msg.channel.send("Never mind.");
		this.terminate();
	} else {
		var sel = Number(msg.content);
		if (!isNaN(sel) && Number.isInteger(sel) && sel > 0) {
			var str = "";
			this.extraData.forEach((item,index) => {
				var p = item.health;
				item.heal(sel);
				str = str.concat(`${index>0 ? "\n" : ""}<@${item.id}>'s HP increases to ${item.health}${p>0 ? "." : "! They're back in the game!"}`);
			});
			msg.channel.send(str.substr(0,2000));
			this.terminate();
		} else msg.channel.send("Invalid amount. Please specify the amount by which you would like to heal the mentioned users, or type `cancel` to cancel.");
	}
}
function clearConfirm(msg) {
	if (/^\W*y/i.test(msg)) {
		cases.get(msg.channel.guild.id).clear();
		msg.channel.send("The Court Record has been cleared. See you in the next turnabout!");
		this.terminate();
	} else if (/^\W*n/i.test(msg)) {
		msg.channel.send("Never mind.");
		this.terminate();
	} else msg.channel.send("Are you sure you want to clear the Court Record of all evidence and profiles? **This action cannot be undone!** Please select Y or N.");
}
function setAttorney(msg) {
	var guild = cases.get(msg.channel.guild.id);
	var role = msg.channel.guild.roles.get(msg.content.replace(/\D/g,""));
	if (/^\W*cancel\W*$/i.test(msg.content)) {
		msg.channel.send("Never mind.");
		this.terminate()
	} else if (role) {
		guild.setAttorneyRole(role);
		msg.channel.send(`Done! **${role.id === guild.id ? "Everyone" : role.name}** are now the Attorneys for this server.`);
		this.terminate();
	} else if (msg.mentions.everyone) {
		role = msg.channel.guild.roles.get(msg.channel.guild.id);
		guild.setAttorneyRole(role);
		msg.channel.send(`Done! **${role.id === guild.id ? "Everyone" : role.name}** are now the Attorneys for this server.`);
		this.terminate();
	} else msg.channel.send(`Please mention or post the ID of the role you would like to declare Attorney, or type \`cancel\`. (Current: **${guild.attorneyRoleId === guild.id ? "Everyone" : guild.attorneyRole.name}**)`);
}

// setup client
client.login('NDA0ODc4ODEzNTkyNTUxNDI0.DUcQUQ.0ZI-s_Mfd9PGcbKgJkqPOe_t2p8');
client.on('ready', () => {
	extrapolateCaseData();
	console.log(`Logged in as ${client.user.username}!`);
	setHelp();
	while ([mProfiles,mEvidence,imgRefs,cases,menus,idcounter,suspects,evidence].includes(undefined)) {}
	setHandlers();
	client.setInterval(updateAndSave, 500);
	client.setInterval(setTyping, 100);
});
function setHelp() {client.user.setActivity('Type `aa.help`', { type: 'PLAYING' });client.setTimeout(setGame,10000)}
function setGame() {client.user.setActivity('Phoenix Wright: Ace Attorney|Phoenix Wright: Ace Attorney: Justice For All|Phoenix Wright: Ace Attorney: Trials and Tribulations|Apollo Justice: Ace Attorney|Ace Attorney Investigations: Miles Edgeworth|Gyakuten Kenji 2|Professor Layton vs. Phoenix Wright: Ace Attorney|Phoenix Wright: Ace Attorney: Dual Destinies|Dai Gyakuten Saiban: Naruhodō Ryūnosuke no Bōken|Phoenix Wright: Ace Attorney: Spirit of Justice|Dai Gyakuten Saiban 2: Naruhodō Ryūnosuke no Kakugo'.split("|").sort((a,b) => {return Math.random()-0.5})[0],{ type: 'PLAYING' });client.setTimeout(setHelp,10000)}
function setTyping() {
	client.channels.forEach(channel => {
		if ("dm,text".split(",").includes(channel.type) && !client.user.typingIn(channel) && typeChannels.has(channel.id)) {
			channel.startTyping();
		} else if ("dm,text".split(",").includes(channel.type) && client.user.typingIn(channel) && !typeChannels.has(channel.id)) {
			channel.stopTyping();
		}
	});
	typeChannels.forEach((value,channel) => {
		if (!client.channels.has(channel) || new Date().getTime() > value + 30000) typeChannels.delete(channel);
	});
}

// handle controls
function setHandlers() {
client.on('message', msg => { if (!msg.author.bot) {
	
	var shout = yells.find(item => {return new RegExp("^\\W*"+item[0]+"\\W*$","i").test(msg.content)});
	if (shout) {
		typeChannels.set(msg.channel.id,new Date().getTime());
		yell(shout[1],msg.channel);
	}
	if (/^\W*((no)?\W*that\W*s\W*wrong|sore\W*wa\W*chigau\W*[yz]o)\W*$/i.test(msg.content)) {
		typeChannels.set(msg.channel.id,new Date().getTime());
		new Counter(msg).gen();
	} else if (/^\W*i\W*agree\W*(with\W*.*)?$/i.test(msg.content)) {
		typeChannels.set(msg.channel.id,new Date().getTime());
		new Consent(msg).gen();
	}
	if (msg.member && getSuspect(msg.member).hasMenu(msg.channel)) {
		getSuspect(msg.member).runMenu(msg);
	}
	if (!(msg.member && getSuspect(msg.member).hasMenu(msg.channel)) && /^\s*aa\W*/i.test(msg.content)) {
		var cmdLine = msg.content.replace(/^\s*aa\W*/i, "");
		var cmd = commands.find(item => {return item.cmd.test(cmdLine) || (Array.isArray(item.aliases) && item.aliases.some(alias => {return alias.test(cmdLine)})) || (item.aliases && !Array.isArray(item.aliases) && item.aliases.test(cmdLine))});
		if (cmd) cmd.execute(msg);
	}
	
}});

client.on('messageReactionAdd', (reac, user) => {
	if (!user.bot && reac.message.channel.guild && getSuspect(reac.message.channel.guild.members.get(user.id)).hasEmojiMenu(reac.message)) {
		getSuspect(reac.message.channel.guild.members.get(user.id)).runEmojiMenu(reac,user);
	} else if (!user.bot && examinations.has(reac.message.channel.id) && examinations.get(reac.message.channel.id).msgId === reac.message.id && getSuspect(reac.message.channel.guild.members.get(user.id)).isAttorney()) examinations.get(reac.message.channel.id).turnPage(reac.emoji.name);
});
client.on('messageReactionRemove', (reac, user) => {
	if (!user.bot && reac.message.channel.guild && getSuspect(reac.message.channel.guild.members.get(user.id)).hasEmojiMenu(reac.message)) {
		getSuspect(reac.message.channel.guild.members.get(user.id)).runEmojiMenu(reac,user);
	} else if (!user.bot && examinations.has(reac.message.channel.id) && examinations.get(reac.message.channel.id).msgId === reac.message.id && getSuspect(reac.message.channel.guild.members.get(user.id)).isAttorney()) examinations.get(reac.message.channel.id).turnPage(reac.emoji.name);
});

client.on('messageDelete', msg => {
	if (emojiMenus.has(msg.id)) emojiMenus.get(msg.id).repost(msg);
	if (examinations.has(msg.channel.id) && examinations.get(msg.channel.id).msgId === msg.id) examinations.get(msg.channel.id).display();
	if (votes.has(msg.id)) {
		vote = votes.get(msg.id);
		votes.delete(msg.id);
		vote.send();
	}
});

client.on('guildMemberAdd', member => {
	new MemberSuspect(member,cases.get(member.guild.id));
});
client.on('guildCreate', guild => {
	cases.set(guild.id, new GuildCase(guild));
});
client.on('roleDelete', role => {
	if (role.id === cases.get(role.guild.id).attorneyRoleId) cases.get(role.guild.id).setAttorneyRole(role.guild.roles.get(role.guild.id));
});

console.log(`Now awaiting commands.`);
}

// initiate commands
const commands = [
	// debug
	new Command(/^ping\b/i, msg => msg.channel.send("Pong.")),
	// cross-examination
	new Command(/^(cross)?\W?exam(ine)?\b/i, function(msg, args){
		if (!examinations.has(msg.channel.id)) {
			msg.channel.send("Please pin or post the ID of the message you would like to cross-examine, or type `cancel` to cancel.");
			new Menu(msg.channel,crossExamineStart,msg.author);
		} else msg.channel.send("A cross-examination is already in progress in this channel. End it with `aa.stop`, or repost the testimony with `aa.repost`.");
	}, null, ["attorney", "guild"]),
	new Command(/^append\b/i, function(msg,args){
		msg.channel.send("Please provide the statement or statements you wish to append to this testimony. Type `cancel` to cancel.");
		new Menu(msg.channel,appendMenu,msg.author);
	}, [/^addendum\b/i], ["attorney","guild","exam"]),
	new Command(/^(redact|strike)\b/i, function(msg,args){
		msg.channel.send(new Discord.RichEmbed()
			.setTitle("Redact this statement? (Y/N)")
			.setDescription(examinations.get(msg.channel.id).arr[examinations.get(msg.channel.id).statement]));
		new Menu(msg.channel,redactConfirm,msg.author);
	}, null, ["attorney","guild","exam"]),
	new Command(/^press\b/i, function(msg, args){
		typeChannels.set(msg.channel.id,new Date().getTime());
		examinations.get(msg.channel.id).pause();
		msg.channel.send(`<@${examinations.get(msg.channel.id).witness.id}>, hold it!\n*${msg.member.displayName}, state your argument now. Type *\`aa.return\`* when you are ready to return to the testimony.*`,new Discord.Attachment("images/bubbles/holdit.png"))
			.then(newMsg => {typeChannels.delete(newMsg.channel.id)})
			.catch(err => {repostPress(msg)});
	}, null, ["attorney","guild","exam"]),
	new Command(/^(stop|quit|end|finish|done|exit|conclude)\b/i, function(msg,args){
		msg.channel.send("Really end this cross-examination? (Y/N)");
		new Menu(msg.channel,examQuitConfirm,msg.author);
	}, null, ["attorney","guild","exam"]),
	new Command(/^(return|continue|repost)\b/i, function(msg,args){
		examinations.get(msg.channel.id).display();
	}, null, ["attorney","guild","exam"]),
	// profiles
	new Command(/^(view)?profiles?\b/i, function(msg,args){
		if (msg.mentions.members.size > 0) {
			if (msg.mentions.members.size < 2) {
				msg.channel.send(suspects.get(msg.channel.guild.id + ":" + msg.mentions.members.first().id).profile.show());
			} else {
				msg.channel.send("Please mention only one user.");
				new Menu(msg.channel,viewProfileMention,msg.author);
			}
		} else {
			msg.channel.send("Please mention the user whose profile you would like to view.");
			new Menu(msg.channel,viewProfileMention,msg.author);
		}
	}, null, "guild"),
	new Command(/^setprofile\b/i, function(msg,args){
		if (msg.mentions.members.size > 0) {
			if (msg.mentions.members.size < 2) {
				var prof = suspects.get(msg.channel.guild.id + ":" + msg.mentions.members.first().id).profile;
				if (!profileEdits.has(prof.id)) {
					prof = new ProfileEdit(prof,new Menu(msg.channel,setProfileSel,msg.author,prof));
					msg.channel.send("Which will you edit (**Name**, **Description**, **Gender**, **Age**, **Alias**, **Image**, or **cancel**)?",prof.show());
					new Menu(msg.channel,setProfileSel,msg.author,prof);
				} else {
					msg.channel.send(`That person's profile is already being edited. ${msg.member.hasPermission("ADMINISTRATOR") ? "Forcefully override the edit? (Y/N)" : "Please wait."}`);
					if (msg.member.hasPermission("ADMINISTRATOR")) new Menu(msg.channel,setProfileOverride,msg.author,ev);
				}
			} else {
				msg.channel.send("Please mention only one user.");
				new Menu(msg.channel,setProfileMention,msg.author);
			}
		} else {
			msg.channel.send("Please mention the user whose profile you would like to set.");
			new Menu(msg.channel,setProfileMention,msg.author);
		}
	}, null, ["attorney","guild"]),
	// evidence
	new Command(/^add\b/i, function(msg, args){
		msg.channel.send("__**New Evidence**__\nFirst, type a name for this piece of evidence. (Type `cancel` to cancel.)");
		new Menu(msg.channel,addEvidenceMenuName,msg.author);
	}, null, ["attorney","guild"]),
	new Command(/^(update|edit)(\W*evidence)?\b/i, function(msg,args){
		if (cases.get(msg.channel.guild.id).evidence.size > 0) {
			cases.get(msg.channel.guild.id).editEvidence(msg);
		} else msg.channel.send("The Court Record is empty!");
	}, null, ["attorney","guild"]),
	new Command(/^(remove|delete|destroy)\b/i, function(msg, args){
		if (cases.get(msg.channel.guild.id).evidence.size > 0) {
			cases.get(msg.channel.guild.id).removeEvidence(msg);
		} else msg.channel.send("The Court Record is empty!");
	}, null, ["attorney","guild"]),
	new Command(/^(record|evidence)\b/i, function(msg, args){
		if (cases.get(msg.channel.guild.id).evidence.size > 0) {
			cases.get(msg.channel.guild.id).displayEvidence(msg);
		} else msg.channel.send("The Court Record is empty!");
	}, null, "guild"),
	new Command(/^present\b/i, function(msg, args){
		if (examinations.has(msg.channel.id)) examinations.get(msg.channel.id).pause();
		if (msg.mentions.members.size>0) {
			if (msg.mentions.members.size<2) {
				var prof = getSuspect(msg.mentions.members.first()).profile;
				if (examinations.has(msg.channel.id)) {
					msg.channel.send("Present this profile? (Y/N)",prof.show());
					new Menu(msg.channel,presentEvidenceConfirm,msg.author,prof);
				} else {
					msg.channel.send("Please mention the user(s) or role(s) to whom you would like to present this profile. Type `cancel` to cancel.",prof.show());
					new Menu(msg.channel,presentEvidenceMention,msg.author,prof);
				}
			} else cases.get(msg.channel.guild.id).presentEvidence(msg);
		} else {
			cases.get(msg.channel.guild.id).presentEvidence(msg);
		}
	}, null, ["attorney","guild"]),
	// health
	new Command(/^(damage|penalty|penalize|punish|punishment)\b/i, function(msg, args){
		if (msg.mentions.members.size>0 || msg.mentions.roles.size>0 || msg.mentions.everyone) {
			var mentions = msg.channel.guild.members.array().filter(member => {return msg.isMentioned(member.id)}).map(member => {return getSuspect(member)});
			if (mentions.length<=25) {
				var emb = new Discord.RichEmbed().setTitle("Penalize users");
				mentions.forEach(member => {emb.addField(member.profile.displayName(),`HP: ${member.health}/100`,true)});
				msg.channel.send("Penalize users by how much? (Type `cancel` to cancel.)",emb);
				new Menu(msg.channel,penalizeAmount,msg.author,mentions);
			} else {
				msg.channel.send("Only 25 users may be penalized at a time. Please mention 25 or fewer users to penalize, or type `cancel` to cancel.");
				new Menu(msg.channel,penalizeUser,msg.author);
			}
		} else {
			msg.channel.send("Which user or users would you like to penalize? Please mention them now, or type `cancel` to cancel.");
			new Menu(msg.channel,penalizeUser,msg.author);
		}
	}, null, ["guild","admin"]),
	new Command(/^heal\b/i, function(msg, args){
		if (msg.mentions.members.size>0 || msg.mentions.roles.size>0 || msg.mentions.everyone) {
			var mentions = msg.channel.guild.members.array().filter(member => {return msg.isMentioned(member.id)}).map(member => {return getSuspect(member)});
			if (mentions.length<=25) {
				var emb = new Discord.RichEmbed().setTitle("Heal users");
				mentions.forEach(member => {emb.addField(member.profile.displayName(),`HP: ${member.health}/100`,true)});
				msg.channel.send("Heal users by how much? (Type `cancel` to cancel.)",emb);
				new Menu(msg.channel,healAmount,msg.author,mentions);
			} else {
				msg.channel.send("Only 25 users may be healed at a time. Please mention 25 or fewer users to heal, or type `cancel` to cancel.");
				new Menu(msg.channel,healUser,msg.author);
			}
		} else {
			msg.channel.send("Which user or users would you like to heal? Please mention them now, or type `cancel` to cancel.");
			new Menu(msg.channel,healUser,msg.author);
		}
	}, null, ["guild","admin"]),
	// judging
	new Command(/^guilty\b/i, function(msg, args){
		typeChannels.set(msg.channel.id,new Date().getTime());
		msg.channel.send(`I hereby declare the defendant${msg.mentions.users.size===1 ? ", **"+getSuspect(msg.mentions.members.first()).profile.displayName()+"**" : ""}...`,new Discord.Attachment("images/splash/guilty.gif"))
			.then(newMsg => {typeChannels.delete(newMsg.channel.id)})
			.catch(err => {repostGuilty(msg)});
	}, null, ["admin","guild"]),
	new Command(/^not\W?(guilty)?\b/i, function(msg, args){
		typeChannels.set(msg.channel.id,new Date().getTime());
		msg.channel.send(`I hereby declare the defendant${msg.mentions.users.size===1 ? ", **"+getSuspect(msg.mentions.members.first()).profile.displayName()+"**" : ""}...`,new Discord.Attachment("images/splash/notguilty.gif"))
			.then(newMsg => {typeChannels.delete(newMsg.channel.id)})
			.catch(err => {repostGuilty(msg)});
	}, null, ["admin","guild"]),
	new Command(/^(jury|vote)\b/i, function(msg,args){
		new Vote(msg).send();
	}, null, "guild"),
	// other
	new Command(/^(help|info(rmation)?)\b/i, function(msg,args){
		msg.channel.send(helpEmbed);
	}),
	new Command(/^(clear|reset)\b/i, function(msg, args){
		msg.channel.send("Are you sure you want to clear the Court Record of all evidence and profiles? **This action cannot be undone!** (Y/N)");
		new Menu(msg.channel,clearConfirm,msg.author);
	}, null, ["guild","admin"]),
	new Command(/^attorney\b/i, function(msg,args){
		var role = msg.channel.guild.roles.get(msg.content.replace(/\D/g,""));
		var guild = cases.get(msg.channel.guild.id);
		if (role) {
			guild.setAttorneyRole(role);
			msg.channel.send(`Done! **${role.id === guild.id ? "Everyone" : role.name}** are now the Attorneys for this server.`);
		} else if (msg.mentions.everyone) {
			role = msg.channel.guild.roles.get(msg.channel.guild.id);
			guild.setAttorneyRole(role);
			msg.channel.send(`Done! **${role.id === guild.id ? "Everyone" : role.name}** are now the Attorneys for this server.`);
		} else {
			msg.channel.send(`Please mention or post the ID of the role you would like to declare Attorney, or type \`cancel\`. (Current: **${guild.attorneyRoleId === guild.id ? "Everyone" : guild.attorneyRole.name}**)`);
			new Menu(msg.channel,setAttorney,msg.author);
		}
	}, null, ["guild","admin"]),
	new Command(/^(yell|shout)\b/i, function(msg,args){
		typeChannels.set(msg.channel.id,new Date().getTime());
		new Bubble(msg).gen();
	})
];