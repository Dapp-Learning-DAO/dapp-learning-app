import { gql } from "@apollo/client";

const REDPACKET_FIELDS = gql`
  fragment RedpacketFields on Redpacket {
    id
    name
    creator
    creationTime
    expireTimestamp
    lock
    ifrandom
    total
    number
    tokenAddress
    refunded
    allClaimed
    token {
      address
      symbol
      name
      decimals
    }
    claimers {
      id
      claimer
      claimedValue
    }
  }
`;

const RedPacketByIdGraph = gql`
  ${REDPACKET_FIELDS}
  query redpacket($redpacketID: ID!) {
    redpacket(id:$redpacketID) {
      ...RedpacketFields
    }
  }
`;

const RedPacketsListsGraph = gql`
  ${REDPACKET_FIELDS}
  query RedpacketsLists(
    $claimableIDs: [Bytes!]
    $claimerAddress: Bytes!
    $expiredTime: BigInt!
    $creator: Bytes!
  ) {
    Claimable: redpackets(where: { id_in: $claimableIDs }) {
      ...RedpacketFields
    }

    Claimed: redpackets(where: { claimers_: { claimer: $claimerAddress } }) {
      ...RedpacketFields
    }

    Expired: redpackets(where: { expireTimestamp_lte: $expiredTime }) {
      ...RedpacketFields
    }

    Created: redpackets(where: { creator: $creator }) {
      ...RedpacketFields
    }
  }
`;

export { RedPacketByIdGraph, RedPacketsListsGraph };
