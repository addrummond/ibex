//
// This is an example data.js for a speeded acceptability judgment
// task.
//

//
// Configuration options.
//
var experimentType = "speeded acceptability";
var showCounter = true;
var acceptabilityRatingsPreamble = "Is this a good sentence?";
var acceptabilityRatings = [["Good", "f"], ["Bad", "j"]];
var answerInstructions = "Press F for good or J for bad";
var practiceSentenceType = "practice";
var shuffleSequence = seq("practice", rshuffle(startsWith("filler"), rshuffle("real1", "real2", "real3", "real4", "real5")));
var showProgressBar = true;
var wordTime = 300;
var wordPauseTime = 100;
var instructionsHTML = "\
<p>\
In this experiment, you'll be reading some sentences.\
After each sentence, you will be asked to judge whether \
the sentence was a possible sentence of English. \
To answer the question, press the &lsquo;F\&rsquo; key for YES or the &lsquo;J&rsquo; key for NO.  \
You will be reminded which key is yes and which is no. \
Try to answer as quickly and accurately as possible. \
If you wait more than 3 seconds to answer, you will not be allowed to answer. \
Try to choose the answer which comes quickest and most naturally for you.\
\
</p>\
<p>\
Please note that you are not being asked to judge whether \
the sentence describes a natural or likely situation, \
but instead whether or not it sounds like a possible sentence of English. \
Likewise, you are not being asked to evaluate the sentences using &ldquo;school grammar.&rdquo; \
You're simply being asked if the sentence sounds like natural English \
that an English speaker might say or write. For example, \
&ldquo;the elephants climbed the trees&rdquo; has an odd meaning, \
but is an acceptable sentence. \
However, it is unlikely that you would find \
&ldquo;the cats the trees climbed&rdquo; a natural sentence of English, \
though you might imagine what it might mean if it were.\
</p>\
\
<p>Press SPACE to begin</p>";

var sentences_strings = [

//
// Practice sentences.
//
["practice","This is a practice sentence to help you get used to the speed of presentation."],
["practice","The exotic new cocktail was invented by the bartender from Spain who thought it should cost at least ten dollars."],
["practice","Because of the warm weather, a crickets have been chirping so loud that the lumberjacks can't sleep."],
["practice","The new computer programs that the software developers were carefully testing were completely free of glitches."],


//
// Real sentences.
//

[["real1",1],"No bills that the Democratic senators have supported will ever become law."],
[["real2",2],"The fashions that no controversial models have worn have ever gotten popular with teenagers."],
[["real3",3],"Even the coastlines that no Navy officers have patrolled have ever been popular among fishermen."],
[["real4",4],"Even the concerts that the crazy fans can sneak into have ever been careful with their security."],
[["real5",5],"Most shows that the famous critics have criticized harshly have ever had a big budget."],
[["real1",6],"No restaurants that the local newspapers have recommended have ever served adventurous dishes."],
[["real2",7],"The knots that no junior campers can tie quickly have ever been needed on short camping trips."],
[["real3",8],"Even the antiques that no private museums have exhibited have ever been sold to private collectors."],
[["real4",9],"Even the codes that the government spies have routinely used have ever used computerized encryption."],
[["real5",10],"Most bicycles that the professional cyclists have endorsed have ever used aluminum gears."],
[["real1",11],"No threats that the secret agents have investigated have ever been featured on the nightly news."],
[["real2",12],"The resorts that no recent hurricanes have damaged have ever ignored the need for insurance."],
[["real3",13],"Even the rivers that no industrial factories have polluted have ever been examined regularly."],
[["real4",14],"Even the tricks that the trained dogs can perform very well have ever impressed a live audience."],
[["real5",15],"Most politicians that the big corporations have supported have ever managed to have a decent campaign."],
[["real1",16],"No parties that the frat boys were invited to attend have ever been short of beer."],
[["real2",17],"The corporations that no government inspectors have suspected have ever managed to hide their shady dealings."],
[["real3",18],"Even the communities that no police officers watch constantly have ever been considered safe."],
[["real4",19],"Even the roads that the highway workers have inspected have ever had awful traffic."],
[["real5",20],"Most cosmetics that the fashion magazines have recommended have ever seemed trustworthy."],
[["real1",21],"No vacuums that the traveling salesmen could sell have ever been sold at major department stores."],
[["real2",22],"The vaccines that no health officials have claimed to be essential have ever been in short supply."],
[["real3",23],"Even the scripts that no movie agencies have favored have ever touched upon sensitive social issues."],
[["real4",24],"Even the projects that the government agencies have considered financing have ever had enthusiastic public support."],
[["real5",25],"Most dances that the trained ballerinas can perform have ever been easy for traditional gypsy dancers."],

[["real2",1],"The bills that no Democratic senators have supported will ever become law."],
[["real3",2],"Even the fashions that no controversial models have worn have ever gotten popular with teenagers."],
[["real4",3],"Even the coastlines that the Navy officers have patrolled have ever been popular among fishermen."],
[["real5",4],"Most concerts that the crazy fans can sneak into have ever been careful with their security."],
[["real1",5],"No shows that the famous critics have criticized harshly have ever had a big budget."],
[["real2",6],"The restaurants that no local newspapers have recommended have ever served adventurous dishes."],
[["real3",7],"Even the knots that no junior campers can tie quickly have ever been needed on short camping trips."],
[["real4",8],"Even the antiques that the private museums have exhibited have ever been sold to private collectors."],
[["real5",9],"Most codes that the government spies have routinely used have ever used computerized encryption."],
[["real1",10],"No bicycles that the professional cyclists have endorsed have ever used aluminum gears."],
[["real2",11],"The threats that no secret agents have investigated have ever been featured on the nightly news."],
[["real3",12],"Even the resorts that no recent hurricanes have damaged have ever ignored the need for insurance."],
[["real4",13],"Even the rivers that the industrial factories have polluted have ever been examined regularly."],
[["real5",14],"Most tricks that the trained dogs can perform very well have ever impressed a live audience."],
[["real1",15],"No politicians that the big corporations have supported have ever managed to have a decent campaign."],
[["real2",16],"The parties that no frat boys were invited to attend have ever been short of beer."],
[["real3",17],"Even the corporations that no government inspectors have suspected have ever managed to hide their shady dealings."],
[["real4",18],"Even the communities that the police officers watch constantly have ever been considered safe."],
[["real5",19],"Most roads that the highway workers have inspected have ever had awful traffic."],
[["real1",20],"No cosmetics that the fashion magazines have recommended have ever seemed trustworthy."],
[["real2",21],"The vacuums that no traveling salesmen could sell have ever been sold at major department stores."],
[["real3",22],"Even the vaccines that no health officials have claimed to be essential have ever been in short supply."],
[["real4",23],"Even the scripts that the movie agencies have favored have ever touched upon sensitive social issues."],
[["real5",24],"Most projects that the government agencies have considered financing have ever had enthusiastic public support."],
[["real1",25],"No dances that the trained ballerinas can perform have ever been easy for traditional gypsy dancers."],

[["real3",1],"Even the bills that no Democratic senators have supported will ever become law."],
[["real4",2],"Even the fashions that the controversial models have worn have ever gotten popular with teenagers."],
[["real5",3],"Most coastlines that the Navy officers have patrolled have ever been popular among fishermen."],
[["real1",4],"No concerts that the crazy fans can sneak into have ever been careful with their security."],
[["real2",5],"The shows that no famous critics have criticized harshly have ever had a big budget."],
[["real3",6],"Even the restaurants that no local newspapers have recommended have ever served adventurous dishes."],
[["real4",7],"Even the knots that the junior campers can tie quickly have ever been needed on short camping trips."],
[["real5",8],"Most antiques that the private museums have exhibited have ever been sold to private collectors."],
[["real1",9],"No codes that the government spies have routinely used have ever used computerized encryption."],
[["real2",10],"The bicycles that no professional cyclists have endorsed have ever used aluminum gears."],
[["real3",11],"Even the threats that no secret agents have investigated have ever been featured on the nightly news."],
[["real4",12],"Even the resorts the the recent hurricanes have damaged have ever ignored the need for insurance."],
[["real5",13],"Most rivers that the industrial factories have polluted have ever been examined regularly."],
[["real1",14],"No tricks that the trained dogs can perform very well have ever impressed a live audience."],
[["real2",15],"The politicians that no big corporations have supported have ever managed to have a decent campaign."],
[["real3",16],"Even the parties that no frat boys were invited to attend have ever been short of beer."],
[["real4",17],"Even the corporations that the government inspectors have suspected have ever managed to hide their shady dealings."],
[["real5",18],"Most communities that the police officers watch constantly have ever been considered safe."],
[["real1",19],"No roads that the highway workers have inspected have ever had awful traffic."],
[["real2",20],"The cosmetics that no fashion magazines have recommended have ever seemed trustworthy."],
[["real3",21],"Even the vacuums that no traveling salesmen could sell have ever been sold at major department stores."],
[["real4",22],"Even the vaccines that the health officials have claimed to be essential have ever been in short supply."],
[["real5",23],"Most scripts that the movie agencies have favored have ever touched upon sensitive social issues."],
[["real1",24],"No projects that the government agencies have considered financing have ever had enthusiastic public support."],
[["real2",25],"The dances that no trained ballerinas can perform have ever been easy for traditional gypsy dancers."],

[["real4",1],"Even the bills that the Democratic senators have supported will ever become law."],
[["real5",2],"Most fashions that the controversial models have worn have ever gotten popular with teenagers."],
[["real1",3],"No coastlines that the Navy officers have patrolled have ever been popular among fishermen."],
[["real2",4],"The concerts that no crazy fans can sneak into have ever been careful with their security."],
[["real3",5],"Even the shows that no famous critics have criticized harshly have ever had a big budget."],
[["real4",6],"Even the restaurants that the local newspapers have recommended have ever served adventurous dishes."],
[["real5",7],"Most knots that the junior campers can tie quickly have ever been needed on short camping trips."],
[["real1",8],"No antiques that the private museums have exhibited have ever been sold to private collectors."],
[["real2",9],"The codes that no government spies have routinely used have ever used computerized encryption."],
[["real3",10],"Even the bicycles that no professional cyclists have endorsed have ever used aluminum gears."],
[["real4",11],"Even the threats that the secret agents have investigated have ever been featured on the nightly news."],
[["real5",12],"Most resorts that the recent hurricanes have damaged have ever ignored the need for insurance."],
[["real1",13],"No rivers that the industrial factories have polluted have ever been examined regularly."],
[["real2",14],"The tricks that no trained dogs can perform very well have ever impressed a live audience."],
[["real3",15],"Even the politicians that no big corporations have supported have ever managed to have a decent campaign."],
[["real4",16],"Even the parties that the frat boys were invited to attend have ever been short of beer."],
[["real5",17],"Most corporations that the government inspectors have suspected have ever managed to hide their shady dealings."],
[["real1",18],"No communities that the police officers watch constantly have ever been considered safe."],
[["real2",19],"The roads that no highway workers have inspected have ever had awful traffic."],
[["real3",20],"Even the cosmetics that no fashion magazines have recommended have ever seemed trustworthy."],
[["real4",21],"Even the vacuums that the traveling salesmen could sell have ever been sold at major department stores."],
[["real5",22],"Most vaccines that the health officials have claimed to be essential have ever been in short supply."],
[["real1",23],"No scripts that the movie agencies have favored have ever touched upon sensitive social issues."],
[["real2",24],"The projects that no government agencies have considered financing have ever had enthusiastic public support."],
[["real3",25],"Even the dances that no trained ballerinas can perform have ever been easy for traditional gypsy dancers."],

[["real5",1],"Most bills that the democratic senators have supported will ever become law."],
[["real1",2],"No fashions that the controversial models have worn have ever gotten popular with teenagers."],
[["real2",3],"The coastlines that no Navy officers have patrolled have ever been popular among fishermen."],
[["real3",4],"Even the concerts that no crazy fans can sneak into have ever been careful with their security."],
[["real4",5],"Even the shows that the famous critics have criticized harshly have ever had a big budget."],
[["real5",6],"Most restaurants that the local newspapers have recommended have ever served adventurous dishes."],
[["real1",7],"No knots that the junior campers can tie quickly have ever been needed on short camping trips."],
[["real2",8],"The antiques that no private museums have exhibited have ever been sold to private collectors."],
[["real3",9],"Even the codes that no government spies have routinely used have ever used computerized encryption."],
[["real4",10],"Even the bicycles that the professional cyclists have endorsed have ever used aluminum gears."],
[["real5",11],"Most threats that the secret agents have investigated have ever been featured on the nightly news."],
[["real1",12],"No resorts that the recent hurricanes have damaged have ever ignored the need for insurance."],
[["real2",13],"The rivers that no industrial factories have polluted have ever been examined regularly."],
[["real3",14],"Even the tricks that no trained dogs can perform very well have ever impressed a live audience."],
[["real4",15],"Even the politicians that the big corporations have supported have ever managed to have a decent campaign."],
[["real5",16],"Most parties that the frat boys were invited to attend have ever been short of beer."],
[["real1",17],"No corporations that the government inspectors have suspected have ever managed to hide their shady dealings."],
[["real2",18],"The communities that no police officers watch constantly have ever been considered safe."],
[["real3",19],"Even the roads that no highway workers have inspected have ever had awful traffic."],
[["real4",20],"Even the cosmetics that the fashion magazines have recommended have ever seemed trustworthy."],
[["real5",21],"Most vacuums that the traveling salesmen could sell have ever been sold at major department stores."],
[["real1",22],"No vaccines that the health officials have claimed to be essential have ever been in short supply."],
[["real2",23],"The scripts that no movie agencies have favored have ever touched upon sensitive social issues."],
[["real3",24],"Even the projects that no government agencies have considered financing have ever had enthusiastic public support."],
[["real4",25],"Even the dances that the trained ballerinas can perform have ever been easy for traditional gypsy dancers."],


// 
// Fillers.
//
["filler2","The foreign spy that encoded the top-secret messages were given a new mission that required going to Japan."],
["filler2","If the overworked students had studied the readings, they get excellent grades in the toughest classes."],
["filler2","No professional drivers who have ever been in an accident can driving school buses."],
["filler1","The receptionist that the real estate company just hired immediately familiarized herself with all the phone numbers of their clients."],
["filler1","Every delicious chocolate cake that the kind baker is making will be one of a kind."],
["filler2","The play that delighted the extremely picky critics have made a fortune at the box office."],
["filler1","The gangsters that the local police officers tracked for years were represented by an inexperienced lawyer."],
["filler2","The woman that John had seen in the subway bought himself a pair of stunning shoes that cost a fortune."],
["filler1","If the award-winning chef had entered this competition, he surely would have won first prize."],
["filler2","If the organized secretary had filed the documents when she first received them, they are easy to find."],
["filler1","If the homemade beer had been left to ferment more, it would have been drinkable."],
["filler2","The cowboy that the bulls tried to trample injured herself getting off a horse."],
["filler1","The patient that was admitted to the hospital last month still suffers severe pain in his left leg."],
["filler2","Very few economists that work in downtown DC will traveling to Russia this year."],
["filler1","The warm weather that everyone had been waiting patiently for melted the frost on the fields in two weeks."],
["filler2","The basketball player that had just signed a million dollar contract bounced the new ball with great skill in twenty minutes."],
["filler2","The girls that rode the elephants at the beginning of the parade was from Africa."],
["filler1","If the spoiled toddler had stopped shouting when the baby sitter asked, he would have gotten a piece of candy."],
["filler2","The brave detective that had just been put on a new case searched for the dangerous criminals at the docks in ten hours."],
["filler2","If the careful scientist had tested his data one more time, he finds that his results were wrong all along."],
["filler1","The cattle that destroyed the farmer's field have eaten all his food as well."],
["filler2","If the amateur marathon runners had practiced more, they finish in the top fifty in this year's marathon."],
["filler2","If the tough boxer had gotten punched in the face one more time, he gets a concussion."],
["filler1","The engineer that designed the new and innovative rocket has bought himself a fancy new desk."],
["filler2","The waiter that the manager scolded in front of customers defended herself."],
["filler1","The construction worker that was fired by four contruction firms in the last three months convinced himself that he was not at fault."],
["filler1","If the old-fashioned farmers had bought new equipment this year, they would have grown a lot more food in their fields."],
["filler1","If the lucky gambler had played one more round of poker, he would have doubled his money."],
["filler2","If the troublesome child had skipped class this morning, he is in detention all afternoon long."],
["filler1","Very few pandas that are in captivity at the National Zoo will have a baby."],
["filler1","Only two specialized surgeons that work in the hospital could do this operation."],
["filler1","The mischevious boy that never took his vitamins ate the candy with his bare hands in ten minutes."],
["filler2","Every new intern that the political campaign group hired will doing lots of work."],
["filler2","Very few romance novels that the author wrote will containing offensive content."],
["filler1","The company that always ignored the environmental regulations was fined thousands of dollars."],
["filler1","If the long-distance calling cards had been cheaper, the freshmen would have called home much more often."],
["filler1","The pistol that the sly robber used in the hold-up was known to be a very dangerous model."],
["filler2","The goofy clown that had been hired for the child's birthday party amused the children with balloon animals in thirty minutes."],
["filler1","The burglar that took the jewelry from the home of the CEO's wife got himself arrested within twenty-four hours."],
["filler2","The tenants that the greedy landlord despised has been evicted for failing to pay rent."],
["filler1","If the small town tourist commission had put an ad in the travel magazines, they would have had more tourist business."],
["filler2","The plants that the gardener trimmed with his special tool has made the house more attractive."],
["filler1","No homework assignments that the cruel professor assigned will count in the course average."],
["filler2","The businessman who made a record number of sales this year treated herself to several drinks."],
["filler2","Only two secret spies that know about this mission could knowing where the documents are."],
["filler1","The nanny that doesn't have much work to do entertained herself in the large empty house."],
["filler2","The actress that the director has chosen for the role of the bank robber has proven himself to be a great talent."],
["filler1","If the brave fireman had waited any longer to enter the building, it would have been too late to save the puppy."],
["filler1","The fireman who saved the mewling kittens from the burning building cut himself on a piece of broken glass."],
["filler1","The hardworking student that took all the toughest English classes read the assigned pieces of literature at the library in two weeks."],
["filler2","The salesman that examined the brand new line of products worry about his job everyday."],
["filler2","If the popular rock band had been successful on their last tour, they have a new multi-million dollar record deal."],
["filler1","The strict teacher whose class some students skipped every day corrected the midterms with a huge red pen in fifty minutes."],
["filler1","If the aging general had consulted his senior officers about the strategy, they would have won the battle easily."],
["filler1","If the lazy employees had met their deadlines, they would have gotten a raise at the end of the year."],
["filler1","The ballerina that rehearsed the Russian ballets every day introduced herself to all the stars from Hollywood after the show."],
["filler1","The plumber that helped the union-certified electricians all the time has retired after twenty years on the job."],
["filler1","The surgeon who worked with well-educated anesthesiologists upset himself with the patient who kept complaining."],
["filler2","The scruffy dog whose owner had accidentally set free frightened the nervous man with its loud bark in two minutes."],
["filler2","The boy that came from a troubled family situation has supported herself with odd jobs for the last several years."],
["filler2","If the cruel pirate had kidnapped the king's daughter, the entire royal army searches for him."],
["filler1","The wrestlers that the television station recruited for their new show exercise at least eight hours a day."],
["filler2","The barber that the four bald men still go see every day is hiring herself a new assistant."],
["filler2","The waitress that served the delicious pizza in under twenty minutes earned himself a giant tip."],
["filler1","The writer that angered the managing editor and his staff is known to often make irritating remarks."],
["filler1","No substitute teachers that know advanced calculus can work on Fridays."],
["filler1","The soldiers that the rustic summer camp lodges each summer love staying in the wilderness."],
["filler2","The teacher that watched the play starring his students were pleased by the final scene."],
["filler2","If the clever bank robbers had forgotten to leave the get-away car running, they get caught by the police."],
["filler1","The nurse that the doctor had been searching for everywhere was upset with herself for being late to a surgery."],
["filler1","Very few angry protesters that the police arrested will spend a night in jail."],
["filler2","The lawyer that met with the shrewd prosecutors meet with the group of clients every week."],
["filler1","The stewardess that was kind to the irritable passengers on the flight poured herself a soda."],
["filler2","If the new fashionable restaurant had opened a new location, it makes record profits this year."],
["filler2","The article that was the source of many scandals were written by a young journalist."],
["filler2","The wise scholar that had translated many classical texts studied the ancient Greek scrolls with his colleagues in twelve months."],
["filler2","The actor whose movie was extremely popular among teenagers killed herself last week."],
["filler2","The freshmen that complain too much about their toughest class has always failed the final exam."],
["filler2","The little girl that played a ghost with a bed sheet on Halloween scared himself in the mirror."],
["filler2","The child that chases the neighbor's dogs around the yard like playing games."]


];
