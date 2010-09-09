function Profiler() {
  var _timestamps = {};
  return {
    mark: function(n) {
      var lastTimestamp = _timestamps[n - 1];
      var currentTimestamp = (new Date()).getTime();
      _timestamps[n] = currentTimestamp;
      if(n === 0) {
        return;
      }
      try {
        console.log(n + '-' + parseInt(n - 1) + ': ' + (currentTimestamp - lastTimestamp));
      }
      catch(e) {}
    }
  }
}

var profiler =  new Profiler();

/**
 * TODO:
 * Make this class a Mediator: let it handle all the
 * interactions between snake and filed, snake and food randomizer, etc.
 *
 * P.S. -- almost done
 */
function Field()
{
  var _width = null;
  var _height = null;
  var _id = null;
  var _snake = null;
  var _foodRandomizer = null;
  var _food = null;
  var _lastFoodId = 0;
  
  return {
    setId: function(id)
    {
      _id = id;

      return this;
    },

    getId: function()
    {
      return _id;
    },

    setFood: function(food)
    {
      _food = food;

      return this;
    },

    getFood: function()
    {
      return _food;
    },

    removeFood: function(foodId)
    {
      _food = null;
      $('#food_' + foodId).remove();
    },

    getWidth: function()
    {
      return parseInt($('#' + this.getId()).width());
    },

    getHeight: function()
    {
      return parseInt($('#' + this.getId()).height());
    },

    setSnake: function(snake)
    {
      _snake = snake;

      return this;
    },

    getSnake: function()
    {
      return _snake;
    },

    setFoodRandomizer: function(foodRandomizer)
    {
      _foodRandomizer = foodRandomizer;

      return this;
    },

    getFoodRandomizer: function()
    {
      return _foodRandomizer;
    },

    dropFood: function()
    {
      var newFoodId = ++_lastFoodId;
      var position = _foodRandomizer.getRandomPosition();
      _food = (new Food(newFoodId)).
        setField(this).
        create(position);
    },

    offerNewGame: function()
    {
      _snake.stop();
      $('#offerNewGameDiv').show();
    }

  }
}

/**
 * Snake class. All basic methods for setting up a game.
 */
function Snake()
{
  var _blocks = new Array();
  var _filterManager = null;
  var _field = null;
  var _id = null;
  var _intervalId = null;
  // randomly places the blocks -- food or snake blocks -- on the field
  var _randomizer = null;
  var _isMoving = false;
  var _blocksToAdd = 0;
  var _stopped = false;

  // direction codes (4 - left, 1 - up, 2 - right, 3 - down) according to
  // pressed key's code
  var _maaaaaaaapaaaaaaaaaa = {
                                37: 4,
                                38: 1,
                                39: 2,
                                40: 3
                              };

  function invertDirection(direction) {
    return direction;
  }
  
  return {
    move: function()
    {
      for(var i = 0; i < _blocks.length; i++)
      {
        _blocks[i].move(); 
      }
      var _this = this;
      _intervalId = setInterval(function() {
        for(var i = _blocks.length - 1; i >= 0; i--)
        {
          var j = _blocks.length - 1 - i;
          profiler.mark(j);
          _blocks[i].move();
        }
        if(_this.occupies(_blocks[0].getPosition(), false))
        {
          _field.offerNewGame();
        }
        if(_this.isOutOfBoundaries()) {
          _field.offerNewGame();
        }
      }, 200);
      _stopped = false;
    },

    isOutOfBoundaries: function() {
      return (_blocks[0].getPosition().left >= _field.getWidth() || _blocks[0].getPosition().top >= _field.getHeight() ||
      _blocks[0].getPosition().left < 0 || _blocks[0].getPosition().top < 0);
    },

    occupies: function(position, includeFirstBlock)
    {
      // the first block can cross the snake it belongs to only in block whose index is at least 4 (starting from 0)
      var i = !! includeFirstBlock ? 0 : 4;
      for(i; i < _blocks.length; i++)
      {
        if(_blocks[i].getPosition().top == position.top && _blocks[i].getPosition().left == position.left)
        {
          return true;
        }
      }
      return false;
    },

    stop: function()
    {
      _stopped = true;
      clearInterval(_intervalId);
    },

    eat: function(food)
    {
      _field.removeFood(food.getId());
      _blocksToAdd = _blocksToAdd + 2;
    },

    getBlocksToAddQuantity: function()
    {
      return _blocksToAdd;
    },

    init: function()
    {
      var _block = (new Block()).
        setSnake(this).
        setId(this.getBlocks().length).
        create().
        setSize($('.block').width());

      this.addBlock(_block);

      this.getField().dropFood();
    },

    start: function()
    {
      this.init();
      var _this = this;
      $(window).keydown(function(e) {
        if(e.keyCode == 32 && _stopped == false) {
          _this.stop();
        }
        else if(e.keyCode == 32 && _stopped == true) {
          _this.move();
        }
        if(_this.getMapa()[e.keyCode] != undefined)
        {
          if (_this.getBlock(0).getDirection() && (_this.getBlock(0).getDirection() - _this.getMapa()[e.keyCode])%2 == 0) {
            return;
          }
          _filterManager.addFilter($('#' + _this.getId() + ' div.block:first-child').position(), _this.getMapa()[e.keyCode]);
          if(_isMoving === false)
          {
            _this.move();
            _isMoving = true;
          }
        }
      })
    },

    getMapa: function()
    {
      return _maaaaaaaapaaaaaaaaaa;
    },

    getBlocks: function() {
      return _blocks;
    },

    getBlock: function(index) {
      return _blocks[index];
    },

    addBlock: function(block)
    {
      _blocks.push(block);
      return this;
    },

    setFilterManager: function(filterManager)
    {
      _filterManager = filterManager;

      return this;
    },

    getFilterManager: function()
    {
      return _filterManager;
    },

    setField: function(field)
    {
      _field = field;

      return this;
    },

    getField: function()
    {
      return _field;
    },

    setId: function(snakeId)
    {
      _id = snakeId;

      return this;
    },

    getId: function()
    {
      return _id;
    },

    setRandomizer: function(randomizer)
    {
      _randomizer = randomizer;

      return this;
    },

    getRandomizer: function()
    {
      return _randomizer;
    }
  }
}

/**
 * Block is the containing part of snake
 */
function Block()
{
  var _direction = null;
  var _blocksToAdd = 0;
  var _intervalId = null;
  var _id = null;
  var _prefix = 'block_';
  var _snake = null;
  var _size = null;
  var _color = '#a5f70b';
  var UP = 1;
  var RIGHT = 2;
  var DOWN = 3;
  var LEFT = 4;

  function _shiftBlock()
  {
    var currentPosition = $('#' + _prefix + _id).position();
    // check if there is another snake div here.
    // check if there is a filter in current cell
    var currentDirection;
    _direction = (currentDirection = getFilter(currentPosition)) ?
      currentDirection : _direction;

    // if current block is the last one and there is a filter
    // in current cell -- remove it
    if($('#' + _snake.getId() + ' #' + _prefix + _id).is(':last-child'))
    {
      _snake.getFilterManager().removeFilter(currentPosition);
    }

    var cssProperty = (_direction == UP || _direction == DOWN) ?
      'top' : 'left';

    if(_direction == UP || _direction == LEFT)
    {
      $('#' + _prefix + _id).css(cssProperty, currentPosition[cssProperty] - _size);
    }
    else
    {
      $('#' + _prefix + _id).css(cssProperty, currentPosition[cssProperty] + _size);
    }

    // check if there is a food stuff in current position
    var newPosition = $('#' + _prefix + _id).position();
    if(_snake.getField().getFood() && _snake.getField().getFood().occupies(newPosition))
    {
      _snake.eat(_snake.getField().getFood());

      // create new food
      _snake.getField().dropFood();

      // add some blocks to the end of snake.
      _blocksToAdd = 4;
    }
    if(_blocksToAdd > 0) {
      appendBlock();
      _blocksToAdd--;
    }
  }

  function appendBlock()
  {
    var lastBlock = _snake.getBlock(_snake.getBlocks().length - 1);
    var position = lastBlock.getPosition();

    var direction = lastBlock.getDirection();
    var _block = (new Block()).
      setSnake(_snake).
      setId(_snake.getBlocks().length).
      setDirection(direction).
      create().
      setColor().
      setSize($('.block').width());

    if(direction === UP)
    {
      position.top = position.top + _block.getSize();
    }
    else if(direction === DOWN)
    {
      position.top = position.top - _block.getSize();
    }
    else if(direction === LEFT)
    {
      position.left = position.left + _block.getSize();
    }
    else if(direction === RIGHT)
    {
      position.left = position.left - _block.getSize();
    }
    _block.setPosition(position);

    _snake.addBlock(_block);
    
  }

  function getFilter(position)
  {
    return _snake.getFilterManager().getFilter(position);
  }

  return {
    move: function()
    {
      _shiftBlock();
    },

    getDirection: function()
    {
      return _direction;
    },

    setDirection: function(direction)
    {
      _direction = direction;

      return this;
    },

    getSize: function()
    {
      return parseInt($('#' + _prefix + _id).width());
    },

    setId: function(blockId)
    {
      _id = blockId;

      return this;
    },

    getId: function()
    {
      return _id;
    },

    getPosition: function()
    {
      return $('#' + _prefix + _id).position();
    },

    setPosition: function(position)
    {
      $('#' + _prefix + _id).css({
        left: position.left,
        top: position.top
      })

      return this;
    },

    setSnake: function(snake)
    {
      _snake = snake;

      return this;
    },

    setColor: function()
    {
      if(arguments[0])
      {
        _color = arguments[0];
      }
      $('#' + _prefix + _id).css({
        background: _color
      })

      return this;
    },

    setSize: function(size)
    {
      _size = parseInt(size);

      return this;
    },

    create: function()
    {
      $('#' + _snake.getId()).append('<div id="' + _prefix + _id + '" class="block"></div>');

      return this;
    }
  }
}

function FoodRandomizer()
{
  var _field = null;
  var _xFieldQuantity = null;
  var _yFieldQuantity = null;
  var _xRandom = null;
  var _yRandom = null;

  function xRandomize()
  {
    _xFieldQuantity = Math.floor(_field.getWidth() /
                                 _field.getSnake().getBlock(0).getSize());
    _xRandom = Math.floor(Math.random()*_xFieldQuantity);
    
    return _xRandom;
  }

  function yRandomize()
  {
    _yFieldQuantity = Math.floor(_field.getHeight() /
                                 _field.getSnake().getBlock(0).getSize());
    _yRandom = Math.floor(Math.random()*_yFieldQuantity);

    return _yRandom;
  }

  return {
    setField: function(field)
    {
      _field = field;

      return this;
    },
    
    getRandomPosition: function()
    {
      var randomPosition = {
                            left: xRandomize()*_field.getSnake().getBlock(0).getSize(),
                            top: yRandomize()*_field.getSnake().getBlock(0).getSize()
                           };
      
      while(_field.getSnake().occupies(randomPosition, true))
      {
        randomPosition = {
                          left: xRandomize()*_field.getSnake().getBlock(0).getSize(),
                          top: yRandomize()*_field.getSnake().getBlock(0).getSize()
                         };
      }

      return randomPosition;
    }
  }
}

function Food(id)
{
  var _field = null;
  var _position = null;
  var _id = id;
  return {
    setField: function(field)
    {
      _field = field;

      return this;
    },
    
    occupies: function(position)
    {
      return ((position.left === _position.left) && (position.top === _position.top));
    },

    getId: function()
    {
      return _id;
    },

    create: function(position)
    {
      _position = position;
      $('#' + _field.getId()).append('<div class="food" id="food_' + _id + '"></div>');
      $('#food_' + _id).css({
        position: 'absolute',
        left: position.left,
        top: position.top
      })

      return this;
    }
  }
}

/**
 * FilterManager -- direction setting system.
 */
function FilterManager()
{
  var _filters = new Object();
  var _snake = null;

  function __construct()
  {

  }

  __construct();
  
  return {
    setSnake: function(snake)
    {
      _snake = snake;

      return this;
    },
    
    addFilter: function(_obj, direction)
    {
      _filters[_obj.left + ',' + _obj.top] = direction;
    },

    getFilter: function(_obj)
    {
      return _filters[_obj.left + ',' + _obj.top];
    },

    removeFilter: function(_obj)
    {
      _filters[_obj.left + ',' + _obj.top] = null;
    }
  }
}

function Initiator() {}

Initiator.initiate = function() {
  Initiator.deleteGame();
  
  var filterManager = new FilterManager();
  var field = new Field();
  var snake = new Snake();
  var foodRandomizer = new FoodRandomizer();

  foodRandomizer.
    setField(field);

  field.
    setId('field')
    .setFoodRandomizer(foodRandomizer)
    .setSnake(snake);

  snake.
    setFilterManager(filterManager).
    setId('snake').
    setField(field);

  filterManager.
    setSnake(snake);

  snake.start();
}

Initiator.deleteGame = function() {
  filterManager = null;
  field = null;
  snake = null;
  foodRandomizer = null;
  $('.food').remove();
  $('#snake').empty();
  $('#offerNewGameDiv').hide();

  // unbind all events except $('#offerNewGameButton').click
  $(window).unbind('keydown');
}

