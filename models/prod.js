
const pool= require('../utils/database');

module.exports = class Car{
    
    // constructor( title, image, price, quantity){
    //     this.title = title;
    //     this.image = image;
    //     this.price = price;
    //     this.quantity = quantity;
    // }

    

    static add_to_cart(id, res){
        
        var someVar = [];
        pool.query("select quantity from products where id = $1", [id], function(err, rows){
            if(err) {
                throw err;
            } else {
                setValue(rows);
            }
        });
        function setValue(value) {
            someVar = value;

            var dd=(someVar['rows'][0]['quantity']);
            if (dd>'0'){
                console.log("valid ordder");
                console.log(Prod.totcreds);
                var q2='update products set quantity = quantity - 1 where id = $1;'
                pool.query(q2,[id]);
    
                var q1='insert into cart values(1,$1,1) \
                on conflict (user_id, item_id) do update set quantity = cart.quantity + 1;'
                pool.query(q1, [id]);
                res.redirect('/cart')
            }
            else{
                console.log("invalid order");
                res.redirect('/prods')
            }
        }
        
    }

    add_prod(){
        const insq=pool.query('INSERT INTO products(title, price, image, quantity) VALUES ($1, $2, $3, $4);', [this.title, this.price, this.image, this.quantity]);
        return insq;
    }
    static get_all(){
        const ap=pool.query('SELECT * FROM products');
        return pool.query('SELECT * FROM products');

    }

};