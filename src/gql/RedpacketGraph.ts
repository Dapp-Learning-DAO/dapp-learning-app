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
    $msg_pre: String!
  ) {
    Claimable: redpackets(
      where: {
        creationTime_gt: $creationTime_gt
        # expireTimestamp_gte: $expiredTime
        message_starts_with: $msg_pre
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
        # creationTime_gt: $creationTime_gt
        message_starts_with: $msg_pre
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
        # creationTime_gt: $creationTime_gt
        message_starts_with: $msg_pre
        expireTimestamp_lte: $expiredTime
      }
      orderDirection: desc
      orderBy: creationTime
      first: 1000
    ) {
      ...RedpacketFields
    }

    Created: redpackets(
      where: {
        message_starts_with: $msg_pre
        creationTime_gt: $creationTime_gt
        creator: $creator
      }
      orderDirection: desc
      orderBy: creationTime
      first: 1000
    ) {
      ...RedpacketFields
    }
  }
`;

export { RedPacketByIdGraph, RedPacketsListsGraph };
