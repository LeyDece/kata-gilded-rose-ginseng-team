const fs = require('fs');
const {assert} = require('chai');
const {Shop, Item} = require('../src/gilded_rose.js');

describe("Gilded Rose", function() {

  it("update quality of a normal item", function() {
    const foo = new Item("foo", 20, 10);

    const shop = new Shop([foo]);
    const items = shop.updateQuality();

    assert.equal(foo.sellIn, 19);
    assert.equal(foo.quality, 9);
  });

  it("shouldn't degrade the quality of an item if it is already 0", () => {
    const foo = new Item("foo", -10, 0);

    const shop = new Shop([foo]);
    const items = shop.updateQuality();

    assert.equal(foo.quality, 0);
  })

  it("should set the quality as 0 if it is 1 while expired", () => {
    const foo = new Item("foo", -10, 1);

    const shop = new Shop([foo]);
    const items = shop.updateQuality();

    assert.equal(foo.quality, 0);
  })

  specify("the quality of an item should degrade twice as fast if it is expired", () => {
    const foo = new Item("foo", -1, 3);
    const bar = new Item("foo", -1, 2);

    const shop = new Shop([foo, bar]);
    const items = shop.updateQuality();

    assert.equal(foo.quality, 1);
    assert.equal(bar.quality, 0);
  })

  specify("if an item starts the day with SellIn being 0, its quality degrades by two", () => {
    const foo = new Item("foo", 0, 3);
    const bar = new Item("foo", 0, 2);

    const shop = new Shop([foo, bar]);
    const items = shop.updateQuality();

    assert.equal(foo.quality, 1);
    assert.equal(bar.quality, 0);
  })

  specify('golden master', function() {
    const { Shop, Item } = require("../src/gilded_rose");

    const items = [
      new Item("+5 Dexterity Vest", 10, 20),
      new Item("Aged Brie", 2, 0),
      new Item("Elixir of the Mongoose", 5, 7),
      new Item("Sulfuras, Hand of Ragnaros", 0, 80),
      new Item("Sulfuras, Hand of Ragnaros", -1, 80),
      new Item("Backstage passes to a TAFKAL80ETC concert", 15, 20),
      new Item("Backstage passes to a TAFKAL80ETC concert", 10, 49),
      new Item("Backstage passes to a TAFKAL80ETC concert", 5, 49),

      // This Conjured item does not work properly yet
      new Item("Conjured Mana Cake", 3, 6),
    ];

    const actualLog = [];
    const days = 30;
    const gildedRose = new Shop(items);

    for (let day = 0; day <= days; day++) {
      actualLog.push(`-------- day ${day} --------`);
      actualLog.push("name, sellIn, quality");
      items.forEach(item => actualLog.push(`${item.name}, ${item.sellIn}, ${item.quality}`));
      gildedRose.updateQuality();
    }

    const text = fs.readFileSync("../golden-master/expected-output.txt", "UTF-8");
    const lines = text.split(/\r?\n/);
    const expectedLog = lines.filter(x => x.length != 0);

    assert.deepEqual(actualLog, expectedLog);

  });

})
