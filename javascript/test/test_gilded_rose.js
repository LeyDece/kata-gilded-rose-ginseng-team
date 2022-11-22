const fs = require("fs");
const { assert } = require("chai");
const { Shop, Item } = require("../src/gilded_rose.js");

describe("Gilded Rose", function () {
  it("update quality of a normal item", function () {
    const foo = new Item("foo", 20, 10);

    const shop = new Shop([foo]);
    const items = shop.updateQuality();

    assert.equal(foo.sellIn, 19);
    assert.equal(foo.quality, 9);
  });

  it("quality cannot be greater than 50", function () {
    const foo = new Item("Aged Brie", 20, 50);

    const shop = new Shop([foo]);
    const items = shop.updateQuality();

    assert.equal(foo.quality, 50);
  });

  it("update quality of Aged Brie before expiration date", () => {
    const brie = new Item("Aged Brie", 20, 10);

    const shop = new Shop([brie]);
    const items = shop.updateQuality();

    assert.equal(brie.sellIn, 19);
    assert.equal(brie.quality, 11);
  });

  it("update quality of Aged Brie after expiration date", () => {
    const brie = new Item("Aged Brie", -20, 10);

    const shop = new Shop([brie]);
    const items = shop.updateQuality();

    assert.equal(brie.sellIn, -21);
    assert.equal(brie.quality, 12);
  });

  it("shouldn't degrade the quality of an item if it is already 0", () => {
    const foo = new Item("foo", -10, 0);

    const shop = new Shop([foo]);
    const items = shop.updateQuality();

    assert.equal(foo.quality, 0);
  });

  it("should set the quality as 0 if it is 1 while expired", () => {
    const foo = new Item("foo", -10, 1);

    const shop = new Shop([foo]);
    const items = shop.updateQuality();

    assert.equal(foo.quality, 0);
  });

  it("Backstage increase by 2 when there are 10 days or less", () => {
    const foo = new Item("Backstage passes to a TAFKAL80ETC concert", 10, 1);

    const shop = new Shop([foo]);
    const items = shop.updateQuality();

    assert.equal(foo.quality, 3);
  });

  it("Backstage increase by 3 when there are 5 days or less", () => {
    const foo = new Item("Backstage passes to a TAFKAL80ETC concert", 5, 1);

    const shop = new Shop([foo]);
    const items = shop.updateQuality();

    assert.equal(foo.quality, 4);
  });

  it("Backstage quality drops to 0 after the concert", () => {
    const foo = new Item("Backstage passes to a TAFKAL80ETC concert", 0, 10);

    const shop = new Shop([foo]);
    const items = shop.updateQuality();

    assert.equal(foo.quality, 0);
  });

  specify(
    "the quality of an item should degrade twice as fast if it is expired",
    () => {
      const foo = new Item("foo", -1, 3);
      const bar = new Item("foo", -1, 2);

      const shop = new Shop([foo, bar]);
      const items = shop.updateQuality();

      assert.equal(foo.quality, 1);
      assert.equal(bar.quality, 0);
    }
  );

  specify(
    "if an item starts the day with SellIn being 0, its quality degrades by two",
    () => {
      const foo = new Item("foo", 0, 3);
      const bar = new Item("foo", 0, 2);

      const shop = new Shop([foo, bar]);
      const items = shop.updateQuality();

      assert.equal(foo.quality, 1);
      assert.equal(bar.quality, 0);
    }
  );

  specify("Sulfuras should never change quality", () => {
    const sulfuras = new Item("Sulfuras, Hand of Ragnaros", 20, 80);

    const shop = new Shop([sulfuras]);
    const items = shop.updateQuality();

    assert.equal(sulfuras.quality, 80);
  })

  specify("Sulfuras' SellIn date should not decrease", () => {
    const sulfuras = new Item("Sulfuras, Hand of Ragnaros", 20, 80);

    const shop = new Shop([sulfuras]);
    const items = shop.updateQuality();

    assert.equal(sulfuras.sellIn, 20);
  })

  specify("golden master", function () {
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
      items.forEach((item) =>
        actualLog.push(`${item.name}, ${item.sellIn}, ${item.quality}`)
      );
      gildedRose.updateQuality();
    }

    const text = fs.readFileSync(
      "../golden-master/expected-output.txt",
      "UTF-8"
    );
    const lines = text.split(/\r?\n/);
    const expectedLog = lines.filter((x) => x.length != 0);

    assert.deepEqual(actualLog, expectedLog);
  });
});
