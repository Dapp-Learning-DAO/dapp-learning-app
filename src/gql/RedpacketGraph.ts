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
    # $claimableIDs: [Bytes!]
    $claimerAddress: Bytes!
    $expiredTime: BigInt!
    $creator: Bytes!
    $creationTime_gt: BigInt!
  ) {
    Claimable: redpackets(
      where: {
        creationTime_gt: $creationTime_gt
        expireTimestamp_gte: $expiredTime
        # claimers_: { claimer_not: $claimerAddress }
      }
      orderDirection: desc
      orderBy: creationTime
      first: 1000
    ) {
      ...RedpacketFields
    }

    Claimed: redpackets(
      where: {
        creationTime_gt: $creationTime_gt
        claimers_: { claimer: $claimerAddress }
      }
      orderDirection: desc
      orderBy: creationTime
      first: 1000
    ) {
      ...RedpacketFields
    }

    Expired: redpackets(
      where: {
        creationTime_gt: $creationTime_gt
        expireTimestamp_lte: $expiredTime
      }
      orderDirection: desc
      orderBy: creationTime
      first: 1000
    ) {
      ...RedpacketFields
    }

    Created: redpackets(
      where: { creationTime_gt: $creationTime_gt, creator: $creator }
      orderDirection: desc
      orderBy: creationTime
      first: 1000
    ) {
      ...RedpacketFields
    }
  }
`;

export { RedPacketByIdGraph, RedPacketsListsGraph };
