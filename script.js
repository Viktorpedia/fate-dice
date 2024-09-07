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
            tie: "You tie, it's success at a minor cost—you're in a tough spot, the enemy gets a boost, or you may take a hit. Alternatively, you fail but gain a boost.",
            succeed: "You succeed, you meet your goal and the story moves on without hiccups",
            succeedwithstyle: "You succeed with style, it's a success and you also get a boost.",
            failure: "You fail, discuss with the GM (and the defending player, if any) whether it's a failure or success at a major cost.",
        },
        createAdvantage: {
            tie: "You tie, you don't create an aspect, but you do get a boost. Existing aspect: If you tie, you gain a boost if the aspect was unknown; it stays unknown. If the aspect is known, you get a free invoke on it instead.",
            succeed: "You succeed, you create a situation aspect with one free invoke on it. Existing aspect: If you succeed, gain a free invoke on the aspect, revealing it if unknown.",
            succeedwithstyle: "You succeed with style, you create a situation aspect with two free invokes on it. Existing aspect: If you succeed with style, gain two free invokes, revealing it if unknown.",
            failure: "You fail, you either don't create the aspect (failure) or you create it but the enemy gets the free invoke (success at a cost). If you succeed at a cost, the final aspect may need to be rewritten to benefit the enemy. This may still be worth it because aspects are true. Existing aspect: If you fail, and the aspect was known, the enemy gets a free invoke. If it was unknown, they may choose to reveal it to get a free invoke.",
        },
        attack: {
            tie: "If you tie, maybe you barely connect, maybe you cause the defender to flinch. Either way, you get a boost.",
            succeed: "If you succeed, you deal a hit equal to the difference between your attack's total and the defense's effort. The defender must absorb this hit with stress or consequences, or else be taken out.",
            succeedwithstyle: "If you succeed with style, you deal a hit just like a success, but you may reduce the shifts of the hit by one to get a boost.",
            failure: "If you fail, you fail to connect—the attack is parried, dodged, or maybe just absorbed by armor.",
        },
        defend: {
            tie: "If you tie, proceed according to the tie result for the opposed action.",
            succeed: "If you succeed, you don't take a hit or you deny the enemy's action.",
            succeedwithstyle: "If you succeed with style, you don't take a hit, you deny the enemy's action, and you even get a boost as you gain the upper hand for a moment.",
            failure: "If you fail against an attack, you take a hit, which you must absorb with stress or consequences. Regardless, the enemy succeeds as described for their action.",
        },
    };


    function updateValues() {
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
        outcomeElem.textContent = outcome;

        const ladderResult = getLadderResult(finalResult);
        document.getElementById('ladderResult').textContent = ladderResult;
        document.getElementById('effort').textContent = finalResult;

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
        return 'Failure';
    }
    function handleAction(action) {
        action = action
        rollDice();
        const skill = parseInt(skillSlider.value);
        const difficulty = parseInt(difficultySlider.value);

        // Update dice results
        const preliminaryResult = skill;
        const secondaryResult = preliminaryResult + diceSum;
        const finalResult = preliminaryResult + diceSum + totalBonus;
        
        // Determine the outcome
        const outcome = calculateOutcome(finalResult);
        const specificOutcome = actionOutcomes[action][outcome.toLowerCase().replace(/ /g, '')];

        // Update the display
        updateValues(); // Make sure this updates all relevant fields

        // Display the action-specific outcome
        document.getElementById('specificOutcome').textContent = specificOutcome;
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

    //document.getElementById('overcomeBtn').addEventListener('click', rollDice);
    //document.getElementById('createAdvantageBtn').addEventListener('click', rollDice);
    //document.getElementById('attackBtn').addEventListener('click', rollDice);
    //document.getElementById('defendBtn').addEventListener('click', rollDice);
    //function handleAction(action) {
    //    rollDice();
    //    updateValues(action); // Pass the action type here
    //}

    document.getElementById('overcomeBtn').addEventListener('click', () => handleAction('overcome'));
    document.getElementById('createAdvantageBtn').addEventListener('click', () => handleAction('createAdvantage'));
    document.getElementById('attackBtn').addEventListener('click', () => handleAction('attack'));
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