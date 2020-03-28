const config = require('config.json');
const db = require('_helpers/db');
const House = db.House;
const fileHelper = require('../_helpers/file-helper');
const path = require('path');

module.exports = {
    getAll,
    getById,
    getByName,
    getByUserAndName,
    getOwnerOf,
    create,
    update,
    deleteContainedBundleByUserAndName,
    delete: _delete
};

async function getAll() {
    return await House.find();
}

async function getById(id) {
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        // Yes, it's a valid ObjectId, proceed with `findById` call.
        return await House.findById(id);
    }else{
        return null;
    }
}

async function getByName(housename){
    return await House.findAll({ name: housename });
}

async function getByUserAndName(username, housename){
    return await House.findOne({ owner: username, name: housename });
}

async function getOwnerOf(id){
    const house = await House.findById(id);

    // validate
    if (!house) throw 'House not found';

    return house.owner;
}

async function create(houseParam) {
    //console.log(houseParam);
    const house = new House(houseParam);

    // save house
    await house.save();
}

async function update(id, houseParam) {
    const house = await House.findById(id);

    // validate
    if (!house) throw 'House not found';
    if (houseParam.name && (house.name !== houseParam.name))
        throw 'Please change house name in Edit User Page.'
    // copy houseParam properties to house
    console.log(houseParam.bg + " | " + house.bg);
    if(houseParam.bg && (house.bg !== houseParam.bg)){
        if(house.bg.indexOf('default')==-1){
            console.log("delete previous file "+house.bg);
            await fileHelper.unlinkFile(path.join(__dirname, '../public', house.bg))
            .catch(err=> {throw err});
        }
    }
    Object.assign(house, houseParam);

    await house.save();
}

async function deleteContainedBundleByUserAndName(username, colName, bundleType, bundleId){
    const house = await House.findOne({ owner: username, name: colName });
    if (!house) throw 'House not found';
    if(house.bundles){
        for(let i = 0; i<house.bundles.length; i++){
            let bundle = house.bundles[i];
            if(bundle.type===bundleType && bundle.id===bundleId){
                console.log(`delete bundle ${bundleId} from ${colName}`);
                house.bundles.splice(i, 1);
                i--;
            }
        }
    }
    await house.save();
    
}

async function _delete(id) {
    await House.findByIdAndRemove(id);
}