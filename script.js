document.addEventListener('DOMContentLoaded', () => {
    const skillSlider = document.getElementById('skill');
    const difficultySlider = document.getElementById('difficulty');
    const skillValue = document.getElementById('skillValue');
    const difficultyValue = document.getElementById('difficultyValue');
    const diceSumElem = document.getElementById('diceSum');
    const preliminaryResultElem = document.getElementById('preliminaryResult');
    const secondaryResultElem = document.getElementById('secondaryResult');
    const finalResultElem = document.getElementById('finalResult');
    const effortElem = document.getElementById('effort');
    const outcomeElem = document.getElementById('outcome');
    const diceElems = [document.getElementById('die1'), document.getElementById('die2'), document.getElementById('die3'), document.getElementById('die4')];
    const rerollProbabilityElem = document.getElementById('rerollProbability');
    const probabilitySucceedWithStyleElem = document.getElementById('probabilitySucceedWithStyle');
    const probabilitySucceedElem = document.getElementById('probabilitySucceed');
    const probabilityTieElem = document.getElementById('probabilityTie');
    const probabilityFailElem = document.getElementById('probabilityFail');

    let fateInvoke = 0;
    let freeInvoke = 0;
    let fateReroll = 0;
    let freeReroll = 0;
    let totalFatePoint = 0;
    let totalInvoke = 0;
    let totalBonus = 0;
    let diceRolls = [0, 0, 0, 0]; // Initialize dice rolls array with zeros
    let diceSum = diceRolls.reduce((a, b) => a + b, 0);
    let currentAction = "placeholder";
    //console.log(currentAction);
    let finalOutcome = "placeholder";
    //console.log(finalOutcome);


    const probabilities = {
        '-4': 1.23,
        '-3': 4.94,
        '-2': 12.35,
        '-1': 19.75,
        '0': 23.46,
        '1': 19.75,
        '2': 12.35,
        '3': 4.94,
        '4': 1.23
    };
    // Fate Ladder levels
    const fateLadder = {
        '8': 'Legendary',
        '7': 'Epic',
        '6': 'Fantastic',
        '5': 'Superb',
        '4': 'Great',
        '3': 'Good',
        '2': 'Fair',
        '1': 'Average',
        '0': 'Mediocre',
        '-1': 'Poor',
        '-2': 'Terrible'
    };
    const actionOutcomes = {
        overcome: {
            tie: "<p>When you tie on a <strong>Overcome Action</strong>, it's success at a minor cost — you're in a tough spot, the enemy gets a boost, or you may take a hit. Alternatively, you fail but gain a boost.</p> <p>Your options are: <ul><li><strong>Succeed</strong>, but the enemy gets a <strong>boost!</strong></li><li><strong>Succeed</strong>, but you take a <strong>hit!</strong></li><li><strong>Failure</strong>, but you get a <strong>boost</strong></li></ul>",
            succeed: "<p>When you succeed on a <strong>Overcome Action</strong>, you meet your goal and the story moves on without hiccups</p>",
            succeedwithstyle: "<p>When you succeed with style on a <strong>Overcome Action</strong>, it's a success and you also get a boost.</p>",
            fail: "<p>When you fail on a <strong>Overcome Action</strong>, discuss with the GM (and the defending player, if any) whether it's a failure or success at a major cost.</p><p>Your options are: <ul><li><strong>Failure</strong>, and nothing else</li><li><strong>Success at a major cost</strong>, which should be pretty bad!</li></ul></p>",
        },
        createAdvantage: {
            tie: "<p>When you tie while trying to <i>create</i> an aspect on a <strong>Create an Advantage</strong> — you don't create an aspect, but you do get a boost.</p><p> When you tie while trying to <i>discover</i> an unknown aspect on a <strong>Create an Advantage Action</strong> the aspect stay unknown but you still get a boost.</p><p>When you are trying to <i>leverage</i> existing known aspect on a <strong>Create an Advantage Action</strong> and you tie, you get a free invoke on it instead.</p>",
            succeed: "<p>When you succeed while trying to <i>create</i> an aspect on a <strong>Create an Advantage</strong> — you create the situational aspect and you get a free invoke on it.</p><p> When you succeed while trying to <i>discover</i> an unknown aspect on a <strong>Create an Advantage Action</strong> the aspect is revealed and you get a free invoke on it.</p><p>When you are trying to <i>leverage</i> existing known aspect on a <strong>Create an Advantage Action</strong> and you succeed and you get a free invoke on it.</p>",
            succeedwithstyle: "<p>When you succeed with style while trying to <i>create</i> an aspect on a <strong>Create an Advantage</strong> — you create the situational aspect and you get two free invokes on it.</p><p> When you succeed while trying to <i>discover</i> an unknown aspect on a <strong>Create an Advantage Action</strong> the aspect is revealed and you get two free invokes on it.</p><p>When you are trying to <i>leverage</i> existing known aspect on a <strong>Create an Advantage Action</strong> and you succeed and you get two free invokes on it.</p>",
            fail: "<p>When you fail while trying to <i>create</i> an aspect on a <strong>Create an Advantage</strong> — you either don't create the situational aspect or you create it but an enemy get a free invoke on it.</p><p> When you fail while trying to <i>discover</i> an unknown aspect on a <strong>Create an Advantage Action</strong> the aspect the enemy may reveal it to get a free invoke on it.</p><p>When you are trying to <i>leverage</i> existing known aspect on a <strong>Create an Advantage Action</strong> and you fail and the enemy get a free invoke on it.</p>",
        },
        attack: {
            tie: "<p>When you tie on a <strong>Attack Action</strong> — maybe you barely connect, maybe you cause the defender to flinch, or get a cut in the face that will momentarily distract them. Either way, you get a <strong>boost!</strong>. If you are using Weapon Extras that deals additional stress you generally still add that on a tie - and you still get the <strong>boost!</strong><p>",
            succeed: "<p>When you succeed on a <strong>Attack Action</strong> — you deal a hit equal to the difference between your attack's total <i>effort</i> and the defense's <i>effort</i>. The defender must absorb this hit with stress or consequences, or else be <strong>taken out</strong>. If you are using Armor Extras that reduce stress taken, and that would reduce it to zero - it is suggested that you <strong>boost!</strong></p><p>A note on scaling and Nameless NPS - a single success with a Weapon Extra with 2 added stress takes out 3 Average Nameless NPC or 1 Fair Filler NPC.</p>",
            succeedwithstyle: "<p>When you succeed with style on a <strong>Attack Action</strong>, you deal a hit just like a success! <strong>And you may</strong> reduce the shifts of the hit by one to get a <strong>boost</strong>!</p><p>Reducing the shift by one now and getting +2 later is often a good idea, because of the bellcurve of 4dF.</p><p>There are two suggested stunts in Fate Core that give you the option to upgrade the boost to an Aspect, which might be good since aspects are true. And it might be easier to motivate a <strong>Create an Advantage Action</strong> later in the conflict.</p>",
            fail: "<p>When you fail on a <strong>Attack Action</strong>, you fail to connect—the attack is parried, dodged, or maybe just absorbed by armor.</p><p>Do remember that when you fail, the opposition might succeed with style, they might get a <strong>boost</strong> from that!</p>",
        },
        defend: {
            tie: "<p>When you tie on a <strong>Defend Action</strong>, proceed according to the tie result for the opposed action. In the case of an attack this might mean that they get a <strong>boost!</strong></p>",
            succeed: "<p>When you suceed on a <strong>Defend Action</strong>, you don't take a hit or you deny the enemy's action.</p>",
            succeedwithstyle: "<p>When you succeed on a <strong>Defend Action</strong>, you don't take a hit, you deny the enemy's action, and you even get a boost as you gain the upper hand for a moment.</p><p>There are two suggested stunts in Fate Core that give you the option to upgrade the boost to an Aspect, which might be good since aspects are true. And it might be easier to motivate a <strong>Create an Advantage Action</strong> later in the conflict.</p>",
            fail: "<p>When you fail on a <strong>Defend Action</strong>, you take a hit, which you must absorb with stress or consequences. Regardless, the enemy succeeds as described for their action. This might lead them to reduce the stress by one to get a <strong>boost</>strong><p>",
        },
        placeholder: {
            tie: "<p>You tie when your <i>effort</i> is <i>equal</i> to the difficulty, or in the case of active opposition, the opposition's <i>effort</i>.</p>",
            succeed: "<p>You succeed when your <i>effort</i> is 1 or 2 <i>more </i>than the difficulty, or in the case of active opposition, the opposition's <i>effort</i>.</p>",
            succeedwithstyle: "<p>You succeed with style when your <i>effort</i> is 3 <i>or more </i>than the difficulty, or in the case of active opposition, the opposition's <i>effort</i>.</p>",
            fail: "<p>You fail when your <i>effort</i> is <i>less than</i> the difficulty, or in the case of active opposition, the opposition's <i>effort</i>.</p>",
        },
    };


    function updateValues() {
        //console.log("Now we are running the update!")
        const skill = parseInt(skillSlider.value);
        const difficulty = parseInt(difficultySlider.value);

        skillValue.textContent = skill;
        difficultyValue.textContent = difficulty;

        const preliminaryResult = skill;
        preliminaryResultElem.textContent = preliminaryResult;

        diceSum = diceRolls.reduce((a, b) => a + b, 0); // Update diceSum from diceRolls array
        diceSumElem.textContent = diceSum;

        const secondaryResult = preliminaryResult + diceSum;
        secondaryResultElem.textContent = secondaryResult;

        const finalResult = preliminaryResult + diceSum + totalBonus;
        finalResultElem.textContent = finalResult;

        const outcome = calculateOutcome(finalResult);
        finalOutcome = calculateOutcome(finalResult);
        //console.log("Value of outcome in updateValue: "+ outcome)
        //console.log("Value of finalOutcome in updateValue: "+ finalOutcome)
        outcomeElem.textContent = outcome;

        const ladderResult = getLadderResult(finalResult);
        document.getElementById('ladderResult').textContent = ladderResult;
        document.getElementById('effort').textContent = finalResult;
        updateActionOutcome(currentAction) //calls to compare and update the outcome
        // Calculate shifts
        const shifts = finalResult - difficulty;
        document.getElementById('shifts').textContent = shifts;
        
        updateDiceDisplay(diceRolls);
        updateEffort(finalResult);

        const probabilitiesResult = calculateProbabilities(skill, difficulty);
        probabilitySucceedWithStyleElem.textContent = probabilitiesResult.succeedWithStyle.toFixed(2) + '%';
        probabilitySucceedElem.textContent = probabilitiesResult.succeed.toFixed(2) + '%';
        probabilityTieElem.textContent = probabilitiesResult.tie.toFixed(2) + '%';
        probabilityFailElem.textContent = probabilitiesResult.fail.toFixed(2) + '%';

        const rerollProbability = calculateRerollProbability();
        rerollProbabilityElem.textContent = rerollProbability.toFixed(2) + '%';

        document.getElementById('totalFatePoint').textContent = totalFatePoint;
        document.getElementById('totalInvoke').textContent = totalInvoke;
        document.getElementById('totalBonus').textContent = totalBonus;
        document.getElementById('freeInvoke').textContent = freeInvoke;


    }

    function rollDice() {
        //console.log("rollDice executed")
        diceRolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 3) - 1);
        diceSum = diceRolls.reduce((a, b) => a + b, 0); // Recalculate diceSum after rolling
        updateValues(); // Update values based on new dice roll
    }

    function updateDiceDisplay(diceRolls) {
        diceRolls.forEach((roll, index) => {
            diceElems[index].textContent = roll === 0 ? '' : roll === 1 ? '+' : '—';
        });
    }

    function updateEffort(secondaryResult) {
        effortElem.textContent = secondaryResult;
    }

    function calculateOutcome(finalResult) {
        const diff = finalResult - parseInt(difficultySlider.value);
        if (diff > 2) return 'Succeed with style';
        if (diff > 0) return 'Succeed';
        if (diff === 0) return 'Tie';
        return 'Fail';
    }
    function handleAction(action) {
        //console.log("Handle Action executed")
        currentAction = action
        //console.log("Set currentAction to: " + currentAction)
        updateActionOutcome(currentAction)
    }

    function updateActionOutcome(currentAction){
        const outcome = finalOutcome;
        const specificOutcome = actionOutcomes[currentAction][outcome.toLowerCase().replace(/ /g, '')];
        //console.log(specificOutcome)
        //Update the display
        document.getElementById('specificOutcome').innerHTML = specificOutcome;
        //console.log("Now it is displayed")
    }

    function calculateProbabilities(skill, difficulty) {
        const result = {
            succeedWithStyle: 0,
            succeed: 0,
            tie: 0,
            fail: 0
        };

        const maxSkill = parseInt(skillSlider.max);
        const minSkill = parseInt(skillSlider.min);
        const maxDifficulty = parseInt(difficultySlider.max);
        const maxDifference = maxDifficulty + Math.abs(minSkill) + 4;
        const skillDiff = difficulty - skill;

        result.tie = parseFloat(probabilities[skillDiff] || 0);
        result.succeed = (parseFloat(probabilities[skillDiff + 1] || 0)) + (parseFloat(probabilities[skillDiff + 2] || 0));
        result.fail = 0;
        for (let i = skillDiff - 1; i >= skillDiff - maxDifference; i--) {
            result.fail += parseFloat(probabilities[i] || 0);
        }

        result.succeedWithStyle = 100 - (result.tie + result.succeed + result.fail);
        return result;
    }

    function calculateRerollProbability() {
        // Calculate the sum of probabilities for outcomes higher than the current diceSum
        const higherOutcomes = Object.keys(probabilities)
        .map(Number)  // Convert keys to numbers
        .filter(value => value > diceSum)  // Filter to only those higher than diceSum
        .reduce((sum, value) => sum + probabilities[value], 0);  // Sum the probabilities

        return higherOutcomes;
    }
    function getLadderResult(finalResult) {
        if (finalResult > 8) return 'Beyond Legendary!';
        if (finalResult < -2) return 'Below Terrible!';
        return fateLadder[finalResult] || 'Unknown'; // Default to 'Unknown' if the result is not in the ladder
    }


    function applyBonus(type) {
        switch (type) {
            case 'fateInvoke':
                fateInvoke++;
                totalFatePoint++;
                totalInvoke++;
                totalBonus += 2;
                break;
            case 'freeInvoke':
                freeInvoke++;
                totalInvoke++;
                totalBonus += 2;
                break;
            case 'fateReroll':
                fateReroll++;
                totalFatePoint++;
                totalInvoke++;
                rollDice();
                break;
            case 'freeReroll':
                freeReroll++;
                freeInvoke++;
                totalInvoke++;
                rollDice();
                break;
        }
        updateValues();
    }

    skillSlider.addEventListener('input', updateValues);
    difficultySlider.addEventListener('input', updateValues);

    document.getElementById('overcomeBtn').addEventListener('click', () => rollDice());
    document.getElementById('overcomeBtn').addEventListener('click', () => handleAction('overcome'));
    document.getElementById('createAdvantageBtn').addEventListener('click', () => rollDice());
    document.getElementById('createAdvantageBtn').addEventListener('click', () => handleAction('createAdvantage'));
    document.getElementById('attackBtn').addEventListener('click', () => rollDice());
    document.getElementById('attackBtn').addEventListener('click', () => handleAction('attack'));
    document.getElementById('defendBtn').addEventListener('click', () => rollDice());
    document.getElementById('defendBtn').addEventListener('click', () => handleAction('defend'));
    

    document.getElementById('fateInvokeBtn').addEventListener('click', () => applyBonus('fateInvoke'));
    document.getElementById('freeInvokeBtn').addEventListener('click', () => applyBonus('freeInvoke'));
    document.getElementById('fateRerollBtn').addEventListener('click', () => applyBonus('fateReroll'));
    document.getElementById('freeRerollBtn').addEventListener('click', () => applyBonus('freeReroll'));

    document.getElementById('resetBtn').addEventListener('click', () => {
        skillSlider.value = 0;
        difficultySlider.value = 0;
        skillValue.textContent = 0;
        difficultyValue.textContent = 0;
        fateInvoke = 0;
        freeInvoke = 0;
        fateReroll = 0;
        freeReroll = 0;
        totalFatePoint = 0;
        totalInvoke = 0;
        totalBonus = 0;
        diceRolls = [0, 0, 0, 0]; // Reset dice rolls
        diceSum = 0; // Reset dice sum
        updateValues();
    });

    updateValues();
});