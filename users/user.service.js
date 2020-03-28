const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const User = db.User;
const houseService = require('../houses/house.service');
//const bundleService = require('../bundles/bundle.service');

module.exports = {
    authenticate,
    getAll,
    getById,
    getByName,
    create,
    update,
    //updateAvatar,
    getMyHouses,
    addHouse,
    deleteHouse,
    delete: _delete
};

async function authenticate({ username, password }) {
    const user = await User.findOne({ username });
    //console.log(password);
    if (user && bcrypt.compareSync(password, user.hash)) {
        const { hash, ...userWithoutHash } = user.toObject();
        const token = jwt.sign({ sub: user.id }, config.secret);
        return {
            ...userWithoutHash,
            token
        };
    }
}

async function getAll() {
    return await User.find().select('-hash');
}

async function getById(id) {
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        // Yes, it's a valid ObjectId, proceed with `findById` call.
        return await User.findById(id).select('-hash');
    }else{
        return null;
    }
}

async function getByName(username){
    return await User.findOne({ username: username }).select('-hash');
}

async function create(userParam) {
    // validate
    if (await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    const user = new User(userParam);

    // hash password
    if (userParam.password) {
        user.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // save user
    await user.save();
}

async function update(id, userParam) {
    const user = await User.findById(id);

    // validate
    if (!user) throw 'User not found';
    if (user.username !== userParam.username && await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    // hash password if it was entered
    if (userParam.password) {
        userParam.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // copy userParam properties to user
    Object.assign(user, userParam);

    await user.save();
    
    const { hash, ...userWithoutHash } = user.toObject();
    const token = jwt.sign({ sub: user.id }, config.secret);
    return {
        ...userWithoutHash,
        token
    };
}

async function getMyHouses(id){
    const user = await User.findById(id);
    // validate
    if (!user) throw 'User not found';

    return await User.findById(id).select('houses');
}

async function addHouse(id, house){
    const user = await User.findById(id);
    // validate
    if (!user) throw 'User not found';

    let updateError=null;
    let updateResult = null;
    await User.updateOne({ _id: id }, 
        { $addToSet: { houses: house.name } }, 
        (err, result) => { 
            //if(err) throw err;//throw to mongodb utils.js
            //else if (result && result.nModified==0){
                //throw 'House name already exist.';
            //}
            updateError = err;
            updateResult = result;
        });
    if(updateError) throw updateError;
    else if (updateResult && updateResult.nModified==0){
        throw 'House name already exists.';
    }
    houseService.create({...house, owner: user.username});
    return await User.findById(id).select('houses');
}

async function deleteHouse(houseId){
    //console.log(houseId);
    const house = await houseService.getById(houseId);
    if (!house) throw 'House not found.';
    //console.log(house.name+" | "+house.owner);
    const user = await User.findOne({username: house.owner});
    if (!user) throw 'User not found.';

    let updateError=null;
    let updateResult = null;
    await User.updateOne({ _id: user.id }, 
        { $pull: { houses: house.name } }, 
        (err, result) => { 
            updateError = err;
            updateResult = result;
        });
    if(updateError) throw updateError;
    else if (updateResult && updateResult.nModified==0){
        throw 'User does not have this house';
    }
    houseService.delete(houseId);
    return await User.findById(user.id).select('houses');
}

async function _delete(id) {
    await User.findByIdAndRemove(id);
}