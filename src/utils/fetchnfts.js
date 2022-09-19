//gon take all the logic for fetch nfts
const apiKey = "RVakgtAN1cOw89v5ZlSrVJ1jSFQyzRug";
const endpoint = `https://eth-mainnet.alchemyapi.io/v2/${apiKey}`;
const getAddressNFTs = async (owner, contractAddress,  retryAttempt) => {
    if (retryAttempt === 5) {
        return;
    }
    if (owner) {
        let data;
        try {
            if (contractAddress) {
                data = await fetch(`${endpoint}/getNFTs?owner=${owner}&contractAddresses%5B%5D=${contractAddress}`).then(data => data.json())
            } else {
                data = await fetch(`${endpoint}/getNFTs?owner=${owner}`).then(data => data.json())
            }
        } catch (e) {
            getAddressNFTs(endpoint, owner, contractAddress, retryAttempt+1)
        }

        // setNFTs(data.ownedNfts)
        return data
    }
}

const getNFTsMetadata = async (NFTS) =>{
    const NFTsMetadata = await Promise.allSettled(NFTS.map(async(NFT)=>{
        const metadata = await fetch(`${endpoint}getNFTMetadata?contractAddress=${NFT.contract.address}&tokenId=${NFT.id.tokenId}`,).then(data => data.json());
        let imageurl;
        console.log("metadata",metadata);
        if(metadata.media[0].uri.gateway.length){
            imageurl=metadata.media[0].uri.gateway;
        }else{
            imageurl="https://via.placeholder.com/500"
        }
        return {
            id:NFT.id.tokenId,
            contractAddress:NFT.contract.address,
            image:imageurl,
            title:metadata.metadata.name,
            description:metadata.metadata.description,
            attributes:metadata.metadata.attributes
        }
    }))
    return NFTsMetadata;
}
const fetchNFTs = async (owner,contractAddress,setNFTs) =>{
    const data =  await getAddressNFTs(owner,contractAddress);
    if(data.ownedNfts.length){ // non-z arrays of nfts
        const NFTs = await getNFTsMetadata(data.ownedNfts)
        let fullfilledNFTs = NFTs.filter(NFT => NFT.status === "fullfilled")
        setNFTs(fullfilledNFTs)
    }else{
        setNFTs(null)
    }
}
export {fetchNFTs};