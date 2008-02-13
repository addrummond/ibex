//var groupChains = [[odd,even]];

var shuffleSequence = seq(anyType);

var ds = DashedSentence;
var q = AcceptabilityJudgment;

var defaults = [
    AcceptabilityJudgment, {q: "How was it?", as: ["Good", "Bad"]}
]

var items = [

[["s1",1], ds, {s: "The journalist interviewed an actress who he knew to be shy of publicity after meeting on a previous occasion"}],
[["s2",1], ds, {s: "The journalist interviewed an actress who after meeting on a previous occasion he knew to be shy of publicity"}],
[["q1",2], q, {s: "Which actress did the journalist interview after meeting her PA on a previous occasion?"}],
[["q2",2], q, {s: "Which actress did the journalist interview her husband after meeting on a previous occasion?"}],

[["s1",2], ds, {s: "The teacher helped struggling students who he encouraged to succeed without treating like idiots"}],
[["s2",2], ds, {s: "The teacher helped struggling students who without treating like idiots he encouraged to succeed"}],
[["q1",3], q, {s: "Which struggling students did the teacher encourage to succeed without treating their friends like idiots?"}],
[["q2",3], q, {s: "Which struggling students did the teacher encourage their friends to succeed without treating like idiots?"}],

[["s1",4], ds, {s: "The geologist photographed a fossil which he found to be older than expected after submitting for analysis"}],
[["s2",4], ds, {s: "The geologist photographed a fossil which after submitting for analysis he found to be older than expected"}],
[["q1",5], q, {s: "Which fossil did the geologist discover its age after photographing?"}],
[["q2",5], q, {s: "Which fossil did the geologist discover after photographing its surroundings?"}],

[["s1",6], ds, {s: "The President proposed secret plans which generals agreed to fast-track for implementation without divulging to Congress"}],
[["s2",6], ds, {s: "The President proposed secret plans which without divulging to Congress the generals agreed to fast-track for implementation"}],
[["q1",7], ds, {s: "Which secret plans did the President propose without divulging their  contents to Congress?"}],
[["q2",7], ds, {s: "Which secret plans did the President propose BLAH BLAH BLAH?"}],

[["s1",8], ds, {s: "Airport officials searched some men who they allowed to get on the plane despite thinking rather suspicious"}],
[["s2",8], ds, {s: "Airport officials searched some men who despite thinking rather suspicious they allowed to get on the plane"}],
[["q1",9], ds, {s: "Which men did airport officials allow to get on the plane despite thinking their demenour rather suspicous?"}],
[["q2",9], ds, {s: "Which men did airport officials allow their bags to go on the plane despite thinking rather suspicous?"}],

[["s1",10], ds, {s: "The carpenter made a chair which designers thought to be really rather trendy after painting turquoise"}],
[["s2",10], ds, {s: "The carpenter made a chair which after painting turquoise designers thought to be really rather trendy"}],
[["q1",11], ds, {s: "Which chair did designers think to be really rather trendy after painting its legs turquoise?"}],
[["q2",11], ds, {s: "Which chair did designers think its appearence to be really rather trendy after painting turquoise?"}],

];
