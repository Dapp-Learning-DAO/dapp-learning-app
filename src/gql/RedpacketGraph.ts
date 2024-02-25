import { gql } from "@apollo/client";

const REDPACKET_FIELDS = gql`
  fragment RedpacketFields on Redpacket {
    id
    name
    creator
    creationTime
    expireTimestamp
    lock
    message
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
    redpacket(id: $redpacketID) {
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
    $creationTime_gt: BigInt!
  ) {
    Claimable: redpackets(
      where: { creationTime_gt: $creationTime_gt }
      orderDirection: desc
      orderBy: creationTime
    ) {
      ...RedpacketFields
    }

    Claimed: redpackets(
      where: { claimers_: { claimer: $claimerAddress } }
      orderDirection: desc
      orderBy: creationTime
    ) {
      ...RedpacketFields
    }

    Expired: redpackets(
      where: { expireTimestamp_lte: $expiredTime }
      orderDirection: desc
      orderBy: creationTime
    ) {
      ...RedpacketFields
    }

    Created: redpackets(
      where: { creator: $creator }
      orderDirection: desc
      orderBy: creationTime
    ) {
      ...RedpacketFields
    }
  }
`;

export { RedPacketByIdGraph, RedPacketsListsGraph };
