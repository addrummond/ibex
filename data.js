//
// Configuration options.
//
var experimentType = "speeded acceptability";
//var experimentType = "self-paced reading";
var showCounter = false;
var acceptabilityRatingsPreamble = "Is this a good sentence?";
var acceptabilityRatings = [["Good", "f"], ["Bad", "j"]];
var answerInstructions = "Press F for good or J for bad";
var shuffleSequence = seq(equalTo0, rshuffle(lessThan0, 1, 2, 3, 4, 5));
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
&ldquo;the cats the trees climbed&rdquo; a natural sentence of English, though you might imagine what it might mean if it were.\
</p>\
\
<p>Press SPACE to begin</p>";

var sentences_strings = [

//
// Practice sentences.
//
[0,"This is a practice sentence to help you get used to the speed of presentation."],
//[0,"This practice sentence will be followed by a question, to make sure you are following along."],
[0,"The exotic new cocktail was invented by the bartender from Spain who thought it should cost at least ten dollars."],
[0,"Because of the warm weather, a crickets have been chirping so loud that the lumberjacks can't sleep."],
[0,"The new computer programs that the software developers were carefully testing were completely free of glitches."],
[0,"The new computer programs that the software developers were carefully testing were completely free of glitches."],


//
// Real sentences.
//

[[1,1],"No bills that the Democratic senators have supported will ever become law."],
[[2,2],"The fashions that no controversial models have worn have ever gotten popular with teenagers."],
[[3,3],"Even the coastlines that no Navy officers have patrolled have ever been popular among fishermen."],
[[4,4],"Even the concerts that the crazy fans can sneak into have ever been careful with their security."],
[[5,5],"Most shows that the famous critics have criticized harshly have ever had a big budget."],
[[1,6],"No restaurants that the local newspapers have recommended have ever served adventurous dishes."],
[[2,7],"The knots that no junior campers can tie quickly have ever been needed on short camping trips."],
[[3,8],"Even the antiques that no private museums have exhibited have ever been sold to private collectors."],
[[4,9],"Even the codes that the government spies have routinely used have ever used computerized encryption."],
[[5,10],"Most bicycles that the professional cyclists have endorsed have ever used aluminum gears."],
[[1,11],"No threats that the secret agents have investigated have ever been featured on the nightly news."],
[[2,12],"The resorts that no recent hurricanes have damaged have ever ignored the need for insurance."],
[[3,13],"Even the rivers that no industrial factories have polluted have ever been examined regularly."],
[[4,14],"Even the tricks that the trained dogs can perform very well have ever impressed a live audience."],
[[5,15],"Most politicians that the big corporations have supported have ever managed to have a decent campaign."],
[[1,16],"No parties that the frat boys were invited to attend have ever been short of beer."],
[[2,17],"The corporations that no government inspectors have suspected have ever managed to hide their shady dealings."],
[[3,18],"Even the communities that no police officers watch constantly have ever been considered safe."],
[[4,19],"Even the roads that the highway workers have inspected have ever had awful traffic."],
[[5,20],"Most cosmetics that the fashion magazines have recommended have ever seemed trustworthy."],
[[1,21],"No vacuums that the traveling salesmen could sell have ever been sold at major department stores."],
[[2,22],"The vaccines that no health officials have claimed to be essential have ever been in short supply."],
[[3,23],"Even the scripts that no movie agencies have favored have ever touched upon sensitive social issues."],
[[4,24],"Even the projects that the government agencies have considered financing have ever had enthusiastic public support."],
[[5,25],"Most dances that the trained ballerinas can perform have ever been easy for traditional gypsy dancers."],

[[2,1],"The bills that no Democratic senators have supported will ever become law."],
[[3,2],"Even the fashions that no controversial models have worn have ever gotten popular with teenagers."],
[[4,3],"Even the coastlines that the Navy officers have patrolled have ever been popular among fishermen."],
[[5,4],"Most concerts that the crazy fans can sneak into have ever been careful with their security."],
[[1,5],"No shows that the famous critics have criticized harshly have ever had a big budget."],
[[2,6],"The restaurants that no local newspapers have recommended have ever served adventurous dishes."],
[[3,7],"Even the knots that no junior campers can tie quickly have ever been needed on short camping trips."],
[[4,8],"Even the antiques that the private museums have exhibited have ever been sold to private collectors."],
[[5,9],"Most codes that the government spies have routinely used have ever used computerized encryption."],
[[1,10],"No bicycles that the professional cyclists have endorsed have ever used aluminum gears."],
[[2,11],"The threats that no secret agents have investigated have ever been featured on the nightly news."],
[[3,12],"Even the resorts that no recent hurricanes have damaged have ever ignored the need for insurance."],
[[4,13],"Even the rivers that the industrial factories have polluted have ever been examined regularly."],
[[5,14],"Most tricks that the trained dogs can perform very well have ever impressed a live audience."],
[[1,15],"No politicians that the big corporations have supported have ever managed to have a decent campaign."],
[[2,16],"The parties that no frat boys were invited to attend have ever been short of beer."],
[[3,17],"Even the corporations that no government inspectors have suspected have ever managed to hide their shady dealings."],
[[4,18],"Even the communities that the police officers watch constantly have ever been considered safe."],
[[5,19],"Most roads that the highway workers have inspected have ever had awful traffic."],
[[1,20],"No cosmetics that the fashion magazines have recommended have ever seemed trustworthy."],
[[2,21],"The vacuums that no traveling salesmen could sell have ever been sold at major department stores."],
[[3,22],"Even the vaccines that no health officials have claimed to be essential have ever been in short supply."],
[[4,23],"Even the scripts that the movie agencies have favored have ever touched upon sensitive social issues."],
[[5,24],"Most projects that the government agencies have considered financing have ever had enthusiastic public support."],
[[1,25],"No dances that the trained ballerinas can perform have ever been easy for traditional gypsy dancers."],

[[3,1],"Even the bills that no Democratic senators have supported will ever become law."],
[[4,2],"Even the fashions that the controversial models have worn have ever gotten popular with teenagers."],
[[5,3],"Most coastlines that the Navy officers have patrolled have ever been popular among fishermen."],
[[1,4],"No concerts that the crazy fans can sneak into have ever been careful with their security."],
[[2,5],"The shows that no famous critics have criticized harshly have ever had a big budget."],
[[3,6],"Even the restaurants that no local newspapers have recommended have ever served adventurous dishes."],
[[4,7],"Even the knots that the junior campers can tie quickly have ever been needed on short camping trips."],
[[5,8],"Most antiques that the private museums have exhibited have ever been sold to private collectors."],
[[1,9],"No codes that the government spies have routinely used have ever used computerized encryption."],
[[2,10],"The bicycles that no professional cyclists have endorsed have ever used aluminum gears."],
[[3,11],"Even the threats that no secret agents have investigated have ever been featured on the nightly news."],
[[4,12],"Even the resorts the the recent hurricanes have damaged have ever ignored the need for insurance."],
[[5,13],"Most rivers that the industrial factories have polluted have ever been examined regularly."],
[[1,14],"No tricks that the trained dogs can perform very well have ever impressed a live audience."],
[[2,15],"The politicians that no big corporations have supported have ever managed to have a decent campaign."],
[[3,16],"Even the parties that no frat boys were invited to attend have ever been short of beer."],
[[4,17],"Even the corporations that the government inspectors have suspected have ever managed to hide their shady dealings."],
[[5,18],"Most communities that the police officers watch constantly have ever been considered safe."],
[[1,19],"No roads that the highway workers have inspected have ever had awful traffic."],
[[2,20],"The cosmetics that no fashion magazines have recommended have ever seemed trustworthy."],
[[3,21],"Even the vacuums that no traveling salesmen could sell have ever been sold at major department stores."],
[[4,22],"Even the vaccines that the health officials have claimed to be essential have ever been in short supply."],
[[5,23],"Most scripts that the movie agencies have favored have ever touched upon sensitive social issues."],
[[1,24],"No projects that the government agencies have considered financing have ever had enthusiastic public support."],
[[2,25],"The dances that no trained ballerinas can perform have ever been easy for traditional gypsy dancers."],

[[4,1],"Even the bills that the Democratic senators have supported will ever become law."],
[[5,2],"Most fashions that the controversial models have worn have ever gotten popular with teenagers."],
[[1,3],"No coastlines that the Navy officers have patrolled have ever been popular among fishermen."],
[[2,4],"The concerts that no crazy fans can sneak into have ever been careful with their security."],
[[3,5],"Even the shows that no famous critics have criticized harshly have ever had a big budget."],
[[4,6],"Even the restaurants that the local newspapers have recommended have ever served adventurous dishes."],
[[5,7],"Most knots that the junior campers can tie quickly have ever been needed on short camping trips."],
[[1,8],"No antiques that the private museums have exhibited have ever been sold to private collectors."],
[[2,9],"The codes that no government spies have routinely used have ever used computerized encryption."],
[[3,10],"Even the bicycles that no professional cyclists have endorsed have ever used aluminum gears."],
[[4,11],"Even the threats that the secret agents have investigated have ever been featured on the nightly news."],
[[5,12],"Most resorts that the recent hurricanes have damaged have ever ignored the need for insurance."],
[[1,13],"No rivers that the industrial factories have polluted have ever been examined regularly."],
[[2,14],"The tricks that no trained dogs can perform very well have ever impressed a live audience."],
[[3,15],"Even the politicians that no big corporations have supported have ever managed to have a decent campaign."],
[[4,16],"Even the parties that the frat boys were invited to attend have ever been short of beer."],
[[5,17],"Most corporations that the government inspectors have suspected have ever managed to hide their shady dealings."],
[[1,18],"No communities that the police officers watch constantly have ever been considered safe."],
[[2,19],"The roads that no highway workers have inspected have ever had awful traffic."],
[[3,20],"Even the cosmetics that no fashion magazines have recommended have ever seemed trustworthy."],
[[4,21],"Even the vacuums that the traveling salesmen could sell have ever been sold at major department stores."],
[[5,22],"Most vaccines that the health officials have claimed to be essential have ever been in short supply."],
[[1,23],"No scripts that the movie agencies have favored have ever touched upon sensitive social issues."],
[[2,24],"The projects that no government agencies have considered financing have ever had enthusiastic public support."],
[[3,25],"Even the dances that no trained ballerinas can perform have ever been easy for traditional gypsy dancers."],

[[5,1],"Most bills that the democratic senators have supported will ever become law."],
[[1,2],"No fashions that the controversial models have worn have ever gotten popular with teenagers."],
[[2,3],"The coastlines that no Navy officers have patrolled have ever been popular among fishermen."],
[[3,4],"Even the concerts that no crazy fans can sneak into have ever been careful with their security."],
[[4,5],"Even the shows that the famous critics have criticized harshly have ever had a big budget."],
[[5,6],"Most restaurants that the local newspapers have recommended have ever served adventurous dishes."],
[[1,7],"No knots that the junior campers can tie quickly have ever been needed on short camping trips."],
[[2,8],"The antiques that no private museums have exhibited have ever been sold to private collectors."],
[[3,9],"Even the codes that no government spies have routinely used have ever used computerized encryption."],
[[4,10],"Even the bicycles that the professional cyclists have endorsed have ever used aluminum gears."],
[[5,11],"Most threats that the secret agents have investigated have ever been featured on the nightly news."],
[[1,12],"No resorts that the recent hurricanes have damaged have ever ignored the need for insurance."],
[[2,13],"The rivers that no industrial factories have polluted have ever been examined regularly."],
[[3,14],"Even the tricks that no trained dogs can perform very well have ever impressed a live audience."],
[[4,15],"Even the politicians that the big corporations have supported have ever managed to have a decent campaign."],
[[5,16],"Most parties that the frat boys were invited to attend have ever been short of beer."],
[[1,17],"No corporations that the government inspectors have suspected have ever managed to hide their shady dealings."],
[[2,18],"The communities that no police officers watch constantly have ever been considered safe."],
[[3,19],"Even the roads that no highway workers have inspected have ever had awful traffic."],
[[4,20],"Even the cosmetics that the fashion magazines have recommended have ever seemed trustworthy."],
[[5,21],"Most vacuums that the traveling salesmen could sell have ever been sold at major department stores."],
[[1,22],"No vaccines that the health officials have claimed to be essential have ever been in short supply."],
[[2,23],"The scripts that no movie agencies have favored have ever touched upon sensitive social issues."],
[[3,24],"Even the projects that no government agencies have considered financing have ever had enthusiastic public support."],
[[4,25],"Even the dances that the trained ballerinas can perform have ever been easy for traditional gypsy dancers."],


// 
// Fillers.
//
[-2,"The foreign spy that encoded the top-secret messages were given a new mission that required going to Japan."],
[-2,"If the overworked students had studied the readings, they get excellent grades in the toughest classes."],
[-2,"No professional drivers who have ever been in an accident can driving school buses."],
[-1,"The receptionist that the real estate company just hired immediately familiarized herself with all the phone numbers of their clients."],
[-1,"Every delicious chocolate cake that the kind baker is making will be one of a kind."],
[-2,"The play that delighted the extremely picky critics have made a fortune at the box office."],
[-1,"The gangsters that the local police officers tracked for years were represented by an inexperienced lawyer."],
[-2,"The woman that John had seen in the subway bought himself a pair of stunning shoes that cost a fortune."],
[-1,"If the award-winning chef had entered this competition, he surely would have won first prize."],
[-2,"If the organized secretary had filed the documents when she first received them, they are easy to find."],
[-1,"If the homemade beer had been left to ferment more, it would have been drinkable."],
[-2,"The cowboy that the bulls tried to trample injured herself getting off a horse."],
[-1,"The patient that was admitted to the hospital last month still suffers severe pain in his left leg."],
[-2,"Very few economists that work in downtown DC will traveling to Russia this year."],
[-1,"The warm weather that everyone had been waiting patiently for melted the frost on the fields in two weeks."],
[-2,"The basketball player that had just signed a million dollar contract bounced the new ball with great skill in twenty minutes."],
[-2,"The girls that rode the elephants at the beginning of the parade was from Africa."],
[-1,"If the spoiled toddler had stopped shouting when the baby sitter asked, he would have gotten a piece of candy."],
[-2,"The brave detective that had just been put on a new case searched for the dangerous criminals at the docks in ten hours."],
[-2,"If the careful scientist had tested his data one more time, he finds that his results were wrong all along."],
[-1,"The cattle that destroyed the farmer's field have eaten all his food as well."],
[-2,"If the amateur marathon runners had practiced more, they finish in the top fifty in this year's marathon."],
[-2,"If the tough boxer had gotten punched in the face one more time, he gets a concussion."],
[-1,"The engineer that designed the new and innovative rocket has bought himself a fancy new desk."],
[-2,"The waiter that the manager scolded in front of customers defended herself."],
[-1,"The construction worker that was fired by four contruction firms in the last three months convinced himself that he was not at fault."],
[-1,"If the old-fashioned farmers had bought new equipment this year, they would have grown a lot more food in their fields."],
[-1,"If the lucky gambler had played one more round of poker, he would have doubled his money."],
[-2,"If the troublesome child had skipped class this morning, he is in detention all afternoon long."],
[-1,"Very few pandas that are in captivity at the National Zoo will have a baby."],
[-1,"Only two specialized surgeons that work in the hospital could do this operation."],
[-1,"The mischevious boy that never took his vitamins ate the candy with his bare hands in ten minutes."],
[-2,"Every new intern that the political campaign group hired will doing lots of work."],
[-2,"Very few romance novels that the author wrote will containing offensive content."],
[-1,"The company that always ignored the environmental regulations was fined thousands of dollars."],
[-1,"If the long-distance calling cards had been cheaper, the freshmen would have called home much more often."],
[-1,"The pistol that the sly robber used in the hold-up was known to be a very dangerous model."],
[-2,"The goofy clown that had been hired for the child's birthday party amused the children with balloon animals in thirty minutes."],
[-1,"The burglar that took the jewelry from the home of the CEO's wife got himself arrested within twenty-four hours."],
[-2,"The tenants that the greedy landlord despised has been evicted for failing to pay rent."],
[-1,"If the small town tourist commission had put an ad in the travel magazines, they would have had more tourist business."],
[-2,"The plants that the gardener trimmed with his special tool has made the house more attractive."],
[-1,"No homework assignments that the cruel professor assigned will count in the course average."],
[-2,"The businessman who made a record number of sales this year treated herself to several drinks."],
[-2,"Only two secret spies that know about this mission could knowing where the documents are."],
[-1,"The nanny that doesn't have much work to do entertained herself in the large empty house."],
[-2,"The actress that the director has chosen for the role of the bank robber has proven himself to be a great talent."],
[-1,"If the brave fireman had waited any longer to enter the building, it would have been too late to save the puppy."],
[-1,"The fireman who saved the mewling kittens from the burning building cut himself on a piece of broken glass."],
[-1,"The hardworking student that took all the toughest English classes read the assigned pieces of literature at the library in two weeks."],
[-2,"The salesman that examined the brand new line of products worry about his job everyday."],
[-2,"If the popular rock band had been successful on their last tour, they have a new multi-million dollar record deal."],
[-1,"The strict teacher whose class some students skipped every day corrected the midterms with a huge red pen in fifty minutes."],
[-1,"If the aging general had consulted his senior officers about the strategy, they would have won the battle easily."],
[-1,"If the lazy employees had met their deadlines, they would have gotten a raise at the end of the year."],
[-1,"The ballerina that rehearsed the Russian ballets every day introduced herself to all the stars from Hollywood after the show."],
[-1,"The plumber that helped the union-certified electricians all the time has retired after twenty years on the job."],
[-1,"The surgeon who worked with well-educated anesthesiologists upset himself with the patient who kept complaining."],
[-2,"The scruffy dog whose owner had accidentally set free frightened the nervous man with its loud bark in two minutes."],
[-2,"The boy that came from a troubled family situation has supported herself with odd jobs for the last several years."],
[-2,"If the cruel pirate had kidnapped the king's daughter, the entire royal army searches for him."],
[-1,"The wrestlers that the television station recruited for their new show exercise at least eight hours a day."],
[-2,"The barber that the four bald men still go see every day is hiring herself a new assistant."],
[-2,"The waitress that served the delicious pizza in under twenty minutes earned himself a giant tip."],
[-1,"The writer that angered the managing editor and his staff is known to often make irritating remarks."],
[-1,"No substitute teachers that know advanced calculus can work on Fridays."],
[-1,"The soldiers that the rustic summer camp lodges each summer love staying in the wilderness."],
[-2,"The teacher that watched the play starring his students were pleased by the final scene."],
[-2,"If the clever bank robbers had forgotten to leave the get-away car running, they get caught by the police."],
[-1,"The nurse that the doctor had been searching for everywhere was upset with herself for being late to a surgery."],
[-1,"Very few angry protesters that the police arrested will spend a night in jail."],
[-2,"The lawyer that met with the shrewd prosecutors meet with the group of clients every week."],
[-1,"The stewardess that was kind to the irritable passengers on the flight poured herself a soda."],
[-2,"If the new fashionable restaurant had opened a new location, it makes record profits this year."],
[-2,"The article that was the source of many scandals were written by a young journalist."],
[-2,"The wise scholar that had translated many classical texts studied the ancient Greek scrolls with his colleagues in twelve months."],
[-2,"The actor whose movie was extremely popular among teenagers killed herself last week."],
[-2,"The freshmen that complain too much about their toughest class has always failed the final exam."],
[-2,"The little girl that played a ghost with a bed sheet on Halloween scared himself in the mirror."],
[-2,"The child that chases the neighbor's dogs around the yard like playing games."]

];

