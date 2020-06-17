let gameInit;
class GameController {
  constructor(url) {
    this.pokemonsList = new PokemonsList(url);
    this.battlefield = new BattleField();
    this.backgroundSound = new Sound('./assets/battle.mp3');
    this.hitSound = new Sound('./assets/hit.wav');
    this.headerHTML = document.querySelector('.header');
    this.pokemonGridHTML = document.querySelector('.pokemons-grid');
    this.pokemonListHTML = document.querySelector('.pokemon-list');
    this.pokemonListBattleHTML = document.querySelector('.pokemon-list-battle');
    this.battlefieldHTML = document.querySelector('.battlefield');
    this.startGameButtonHTML = document.querySelector('.start-button');
    this.startBattleButtonHTML = document.querySelector('.start-battle');
    this.playAgainButtonHTML = document.querySelector('.play-again');
    this.resultHTML = document.querySelector('.result');
    this.searchHTML = document.querySelector('.search-field');
    this.searchInputHTML = document.querySelector('.search-field-input');
    this.bgImageHTML = document.querySelector('.image-bg');
    this.initEvents();
  }

  playAgain() {
    document
      .querySelector('.play-again-button')
      .addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleClass(this.pokemonGridHTML, 'hidden');
        this.toggleClass(this.battlefieldHTML, 'hidden');
        this.toggleClass(this.playAgainButtonHTML, 'hidden');
        this.toggleClass(this.resultHTML, 'hidden');
        this.toggleClass(this.startBattleButtonHTML, 'hidden');
        this.toggleClass(this.bgImageHTML, 'bg-stretch');

        this.pokemonListBattleHTML.innerHTML = '';
        this.resultHTML.innerHTML = '';
        this.backgroundSound.stop();
        this.battlefield = new BattleField();
      });
  }

  startBattle() {
    this.startBattleButtonHTML.addEventListener('click', (e) => {
      e.stopPropagation();
      gameInit.backgroundSound.play();
      this.battlefield.starterPlayer();
      this.battlefield.attack();
      this.battlefield.startAttacking();
      this.toggleClass(this.startBattleButtonHTML, 'hidden');
    });
  }

  renderBattlefield() {
    this.pokemonListHTML.addEventListener('click', (e) => {
      e.stopPropagation();
      if (e.target.className === 'select-pokemon-button') {
        this.generateBattleField();
      }
    });
  }

  generateBattleField() {
    this.toggleClass(this.battlefieldHTML, 'hidden');
    this.toggleClass(this.pokemonGridHTML, 'hidden');
    this.toggleClass(this.bgImageHTML, 'bg-stretch');

    const playerBattlePokemon = this.createBattlePokemon(
      this.pokemonsList.playerPokemon,
      'player'
    );
    const computerBattlePokemon = this.createBattlePokemon(
      this.pokemonsList.computerPokemon,
      'computer'
    );

    this.battlefield.setPlayerPokemon(playerBattlePokemon);
    this.battlefield.setComputerPokemon(computerBattlePokemon);
    this.battlefield.renderBattlePokemons();
  }

  createBattlePokemon(pokemon, player) {
    const pokemonObj = {
      player: player,
      id: pokemon.id,
      name: pokemon.name,
      frontSprite: pokemon.sprites.front_default,
      backSprite: pokemon.sprites.back_default,
      hp: pokemon.stats.find((stat) => stat.statName === 'hp').stat,
      attack: pokemon.stats.find((stat) => stat.statName === 'attack').stat,
      defense: pokemon.stats.find((stat) => stat.statName === 'defense').stat,
      speed: pokemon.stats.find((stat) => stat.statName === 'speed').stat,
      hpRemaining: pokemon.stats.find((stat) => stat.statName === 'hp').stat,
    };

    return pokemonObj;
  }

  firstLetterToUpperCase(str) {
    const toUpperCase = str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    return toUpperCase;
  }

  toggleClass(element, cssClass) {
    element.classList.toggle(cssClass);
  }

  initEvents() {
    this.renderBattlefield();
    this.startBattle();
    this.playAgain();
  }
}
class PokemonsList {
  constructor(url) {
    this.url = url;
    this.pokemons = [];
    this.playerPokemon = {};
    this.computerPokemon = {};
    this.fetchPokemons();
    this.initEvents();
  }

  async fetchPokemons() {
    const listOfPokemonsResponse = await fetch(this.url);
    const pokemonMetadata = await listOfPokemonsResponse.json();

    for (let pokemon of pokemonMetadata.results) {
      const pokemonDataResponse = await fetch(pokemon.url);
      const pokemonData = await pokemonDataResponse.json();

      const pokemonDataObj = {
        id: pokemonData.id,
        sprites: pokemonData.sprites,
        name: pokemonData.name,
        ability: pokemonData.abilities[0].ability.name,
        moves: pokemonData.moves.slice(0, 4).map(({ move: { name } }) => {
          return { moveName: name };
        }),
        stats: pokemonData.stats.map(({ base_stat, stat }) => {
          return { statName: stat.name, stat: base_stat };
        }),
      };
      const { id, sprites, name, ability, moves, stats } = pokemonDataObj;
      this.pokemons.push(new Pokemon(id, sprites, name, ability, moves, stats));
    }
    this.renderPokemons(this.pokemons);
    gameInit.toggleClass(gameInit.startGameButtonHTML, 'hidden');
    gameInit.toggleClass(gameInit.searchHTML, 'hidden');
    gameInit.toggleClass(gameInit.bgImageHTML, 'bg-stretch');
    this.filterPokemons();
  }

  renderPokemons(pokemonsArr) {
    // Create HTML li for each pokemon
    for (let pokemon of pokemonsArr) {
      const { id, sprites, name, ability, moves, stats } = pokemon;
      const newLi = document.createElement('li');
      newLi.classList.add(name);
      newLi.dataset.id = id;
      newLi.innerHTML = `
            <img src="${sprites.front_default}" class='pokemon-image' />
            <div class="pokemon-data">
              <p>Name: ${gameInit.firstLetterToUpperCase(name)}</p>
              <p>Ability: ${gameInit.firstLetterToUpperCase(ability)}</p>
              ${moves
                .map(
                  ({ moveName }, index) =>
                    `<p>Move ${index + 1}: ${gameInit.firstLetterToUpperCase(
                      moveName
                    )}</p>`
                )
                .join(' ')}
                ${stats
                  .map(
                    ({ statName, stat }) =>
                      `<p>${gameInit.firstLetterToUpperCase(
                        statName
                      )}: ${stat}</p>`
                  )
                  .join(' ')}
              </div>
              <button class="select-pokemon-button">Select</button>
              `;
      gameInit.pokemonListHTML.appendChild(newLi);
    }
  }

  filterPokemons() {
    gameInit.searchInputHTML.addEventListener('input', (e) => {
      const renderedPokemons = this.pokemons.filter(({ name }) =>
        name.toLowerCase().includes(e.target.value.toLowerCase())
      );
      gameInit.pokemonListHTML.innerHTML = '';
      this.renderPokemons(renderedPokemons);
      if (renderedPokemons.length < 5) {
        gameInit.bgImageHTML.classList.remove('bg-stretch');
      } else {
        gameInit.bgImageHTML.classList.add('bg-stretch');
      }
    });
  }

  selectPokemon() {
    const selectButton = document.querySelector('.pokemon-list');
    selectButton.addEventListener('click', (e) => {
      e.stopPropagation();
      if (e.target.className === 'select-pokemon-button') {
        const pokemonId = e.target.parentNode.getAttribute('data-id');
        this.playerPokemon = this.pokemons.find(
          (pokemon) => pokemon.id === parseInt(pokemonId)
        );

        this.randomComputerPokemon(pokemonId);
      }
    });
  }

  randomComputerPokemon(playerPokemonId) {
    const pokemonsLeft = this.pokemons.filter(
      (pokemon) => pokemon.id !== parseInt(playerPokemonId)
    );
    const randomNum = Math.floor(Math.random() * pokemonsLeft.length);
    this.computerPokemon = pokemonsLeft[randomNum];
  }

  initEvents() {
    this.selectPokemon();
  }
}
class BattleField {
  constructor() {
    this.playerPokemon = null;
    this.computerPokemon = null;
    this.playerTurn = null;
    this.isGameOver = false;
  }

  setComputerPokemon(pokemon) {
    this.computerPokemon = pokemon;
  }

  setPlayerPokemon(pokemon) {
    this.playerPokemon = pokemon;
  }

  renderBattlePokemons() {
    this.createBattlePokemonHTML(this.playerPokemon);
    this.createBattlePokemonHTML(this.computerPokemon);
  }

  renderAttack() {
    const attackingPlayer =
      this.playerTurn === 'player' ? this.playerPokemon : this.computerPokemon;
    const defendingPlayer =
      this.playerTurn === 'player' ? this.computerPokemon : this.playerPokemon;

    this.attackDmg(attackingPlayer, defendingPlayer);
    this.renderAnimateAttack(attackingPlayer, 2000);
    setTimeout(() => {
      this.renderAnimateBlink(defendingPlayer);
    }, 1000);

    this.playerTurn = this.playerTurn === 'player' ? 'computer' : 'player';
  }

  renderNewHP(totalDmg) {
    this.changeStateHP(totalDmg);
    this.changeHtmlHP();
  }

  renderAnimateAttack({ name, player }, time) {
    const direction = player === 'player' ? 'right' : 'left';
    const pokeImg = document.querySelector(
      `.pokemon-list-battle .${name} .pokemon-image`
    );

    const calX = Math.abs(window.innerWidth / 2.1);
    if (direction === 'right') {
      pokeImg.style.transition = 'transform 1.0s linear 0s';
      pokeImg.style.transform = `translateX(${calX}px) translateY(-210px)`;
    } else if (direction === 'left') {
      pokeImg.style.transition = 'transform 1.0s linear 0s';
      pokeImg.style.transform = `translateX(-${calX}px) translateY(210px)`;
    }
    setTimeout(() => {
      pokeImg.style.transition = '';
      pokeImg.style.transform = '';
      gameInit.hitSound.play();
    }, time);
  }

  renderAnimateBlink({ name }) {
    let times = 0;
    const pokeStat = document.querySelector(
      `.pokemon-list-battle .${name} .pokemon-data`
    );
    const blink = setInterval(() => {
      gameInit.toggleClass(pokeStat, 'blink');
      times++;
      if (times === 6) {
        clearInterval(blink);
        pokeStat.classList.remove('blink');
      }
    }, 500);
  }

  renderBattleResult() {
    const result = gameInit.resultHTML;
    const playAgain = gameInit.playAgainButtonHTML;

    result.innerHTML =
      this.computerPokemon.hpRemaining <= 0
        ? '<p class="won">You Win</p>'
        : '<p class="lost">You Loose</p>';

    gameInit.toggleClass(result, 'hidden');
    gameInit.toggleClass(playAgain, 'hidden');
  }

  createBattlePokemonHTML(pokemon) {
    const pokemonList = gameInit.pokemonListBattleHTML;
    const { player, id, name, frontSprite, backSprite, hpRemaining } = pokemon;
    const newLi = document.createElement('li');
    const playerSprite = `<img src="${backSprite}" class='pokemon-image' />`;
    const computerSprite = `<img src="${frontSprite}" class='pokemon-image' />`;

    newLi.classList.add(name);
    newLi.dataset.id = id;

    const html = `
    ${player === 'computer' ? computerSprite : ''}
    <div class="pokemon-data">
    <h3>${gameInit.firstLetterToUpperCase(name)}</h3>
    <div class='hp-bar excellent'>${hpRemaining}</div>
    </div>
    ${player === 'player' ? playerSprite : ''}
    `;

    newLi.innerHTML = html;
    pokemonList.appendChild(newLi);
  }

  startAttacking() {
    const battle = setInterval(() => {
      this.attack(battle);
    }, 4500);
  }

  attack(interval) {
    if (!this.isGameOver) {
      this.renderAttack();
    } else {
      clearInterval(interval);
      this.renderBattleResult();
    }
  }

  attackDmg(attacker, defender) {
    const attackerDmg = attacker.attack;
    const defenderDef = defender.defense;
    const randomNumb = Math.floor(Math.random() * 100);
    const totalDmg = Math.round((attackerDmg / defenderDef) * randomNumb);
    this.renderNewHP(totalDmg);
  }

  changeStateHP(dmg) {
    const defender =
      this.playerTurn === 'player' ? this.computerPokemon : this.playerPokemon;

    if (defender.hpRemaining - dmg > 0) {
      defender.hpRemaining -= dmg;
    } else {
      defender.hpRemaining = 0;
      this.isGameOver = true;
    }
  }

  changeHtmlHP() {
    const defender =
      this.playerTurn === 'player' ? this.computerPokemon : this.playerPokemon;
    const { name, hpRemaining, hp } = defender;
    const pokemonHP = document.querySelector(
      `.pokemon-list-battle .${name} .pokemon-data .hp-bar`
    );
    const isAlive = hpRemaining > 0 ? true : false;
    const hpPerc = Math.floor((100 * hpRemaining) / hp);

    if (isAlive) {
      pokemonHP.innerText = hpRemaining;
    } else {
      pokemonHP.innerText = 0;
    }

    if (hpPerc < 10) {
      pokemonHP.classList.remove('good');
      pokemonHP.classList.add('bad');
    } else if (hpPerc < 50) {
      pokemonHP.classList.remove('excellent');
      pokemonHP.classList.add('good');
    }
  }

  starterPlayer() {
    this.playerTurn =
      this.playerPokemon.speed > this.computerPokemon.speed
        ? 'player'
        : 'computer';
  }
}
class Pokemon {
  constructor(id, sprites, name, ability, moves, stats) {
    this.id = id;
    this.sprites = sprites;
    this.name = name;
    this.ability = ability;
    this.moves = moves;
    this.stats = stats;
  }
}
class Sound {
  constructor(src) {
    this.sound = document.createElement('audio');
    this.sound.src = src;
    this.sound.setAttribute('preload', 'auto');
    this.sound.setAttribute('controls', 'none');
    this.sound.style.display = 'none';
    document.body.appendChild(this.sound);
  }

  play() {
    this.sound.play();
  }

  stop() {
    this.sound.pause();
    this.sound.currentTime = 0;
  }
}

function renderPokemonList() {
  gameInit = new GameController('https://pokeapi.co/api/v2/pokemon/');
}
